const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const prisma = require('../../helpers/prisma');
const jwtHelper = require('../../helpers/jwtHelper');

class AuthController {
  /**
   * Registrasi Pengguna Gateway Baru
   * Memerlukan: name, username, email, password, appName, purpose, allowedDomains (opsional)
   */
  async register(req, res) {
    try {
      const { name, username, email, password, appName, purpose, allowedDomains } = req.body;

      if (!name || !username || !email || !password || !appName || !purpose) {
        return res.status(400).json({
          success: false,
          message: 'Field name, username, email, password, appName, dan purpose wajib diisi!'
        });
      }

      // Cek apakah username atau email sudah terdaftar
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ username }, { email }]
        }
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Username atau email sudah digunakan oleh pengguna lain'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Buat API Key unik untuk akses server-to-server
      const apiKey = `gw_${crypto.randomBytes(24).toString('hex')}`;

      const user = await prisma.user.create({
        data: {
          name,
          username,
          email,
          password: hashedPassword,
          appName,
          purpose,
          allowedDomains: allowedDomains || null,
          apiKey,
          role: 'CLIENT',
          status: 'ACTIVE'
        },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          appName: true,
          purpose: true,
          allowedDomains: true,
          apiKey: true,
          role: true,
          status: true,
          createdAt: true
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Registrasi berhasil! Anda dapat langsung login atau menggunakan API Key.',
        data: user
      });
    } catch (error) {
      console.error('[AUTH REGISTER ERROR]', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal melakukan registrasi pengguna',
        error: error.message
      });
    }
  }

  /**
   * Login Pengguna & Set HttpOnly Cookie
   */
  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username dan password wajib diisi'
        });
      }

      const user = await prisma.user.findFirst({
        where: {
          OR: [{ username }, { email: username }]
        }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Username atau password salah'
        });
      }

      if (user.status !== 'ACTIVE') {
        return res.status(403).json({
          success: false,
          message: `Akun Anda sedang berstatus ${user.status}. Hubungi administrator.`
        });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Username atau password salah'
        });
      }

      const payload = {
        id: user.id,
        username: user.username,
        role: user.role,
        appName: user.appName
      };

      // Generate Access Token & Refresh Token
      const accessToken = jwtHelper.generateAccessToken(payload);
      const refreshToken = jwtHelper.generateRefreshToken(payload);

      // Simpan Refresh Token ke Database
      const expiresAt = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)); // 7 hari
      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt
        }
      });

      // Set ke HttpOnly Cookie
      jwtHelper.setAuthCookies(res, accessToken, refreshToken);

      return res.status(200).json({
        success: true,
        message: 'Login berhasil! Token telah disimpan di HttpOnly Cookie.',
        data: {
          user: {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            appName: user.appName,
            purpose: user.purpose,
            apiKey: user.apiKey,
            role: user.role
          },
          accessToken
        }
      });
    } catch (error) {
      console.error('[AUTH LOGIN ERROR]', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat login',
        error: error.message
      });
    }
  }

  /**
   * Refresh Access Token menggunakan Refresh Token dari HttpOnly Cookie
   */
  async refresh(req, res) {
    try {
      const refreshToken = req.cookies?.refresh_token || req.body?.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token tidak ditemukan di cookie atau request body'
        });
      }

      // Verifikasi JWT Refresh Token
      let decoded;
      try {
        decoded = jwtHelper.verifyRefreshToken(refreshToken);
      } catch (err) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token tidak valid atau telah kedaluwarsa'
        });
      }

      // Cek status refresh token di database
      const dbToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken }
      });

      if (!dbToken || dbToken.revoked || dbToken.expiresAt < new Date()) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token telah dicabut atau kedaluwarsa'
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.id }
      });

      if (!user || user.status !== 'ACTIVE') {
        return res.status(403).json({
          success: false,
          message: 'Pengguna tidak ditemukan atau berstatus tidak aktif'
        });
      }

      const payload = {
        id: user.id,
        username: user.username,
        role: user.role,
        appName: user.appName
      };

      const newAccessToken = jwtHelper.generateAccessToken(payload);

      // Perbarui access token cookie
      jwtHelper.setAuthCookies(res, newAccessToken);

      return res.status(200).json({
        success: true,
        message: 'Access token berhasil diperbarui',
        accessToken: newAccessToken
      });
    } catch (error) {
      console.error('[AUTH REFRESH ERROR]', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal merefresh access token',
        error: error.message
      });
    }
  }

  /**
   * Logout: Cabut Refresh Token di DB & Bersihkan Cookie
   */
  async logout(req, res) {
    try {
      const refreshToken = req.cookies?.refresh_token || req.body?.refreshToken;

      if (refreshToken) {
        await prisma.refreshToken.updateMany({
          where: { token: refreshToken, revoked: false },
          data: { revoked: true }
        });
      }

      jwtHelper.clearAuthCookies(res);

      return res.status(200).json({
        success: true,
        message: 'Logout berhasil! Cookie otentikasi telah dibersihkan.'
      });
    } catch (error) {
      console.error('[AUTH LOGOUT ERROR]', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat logout',
        error: error.message
      });
    }
  }

  /**
   * Cek Profil Pengguna yang Sedang Login
   */
  async getProfile(req, res) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          appName: true,
          purpose: true,
          allowedDomains: true,
          apiKey: true,
          role: true,
          status: true,
          createdAt: true
        }
      });

      return res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil data profil pengguna',
        error: error.message
      });
    }
  }

  /**
   * Mengambil Riwayat Akses / Audit Log Pengguna
   */
  async getLogs(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const where = req.user.role === 'ADMIN' ? {} : { userId: req.user.id };

      const [total, logs] = await Promise.all([
        prisma.apiAccessLog.count({ where }),
        prisma.apiAccessLog.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          include: {
            user: {
              select: { id: true, name: true, username: true, appName: true, purpose: true }
            }
          }
        })
      ]);

      return res.status(200).json({
        success: true,
        data: {
          total,
          page,
          totalPages: Math.ceil(total / limit),
          logs
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil data log riwayat akses',
        error: error.message
      });
    }
  }
}

module.exports = new AuthController();
