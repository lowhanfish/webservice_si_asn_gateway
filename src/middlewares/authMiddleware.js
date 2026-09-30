const jwtHelper = require('../helpers/jwtHelper');
const prisma = require('../helpers/prisma');

/**
 * Middleware untuk memverifikasi otentikasi pengguna
 * Mendukung 3 metode:
 * 1. HttpOnly Cookie ('access_token')
 * 2. Header Authorization ('Bearer <token>')
 * 3. Header 'x-api-key' (untuk integrasi server-to-server)
 */
async function authMiddleware(req, res, next) {
  try {
    let token = req.cookies?.access_token;

    // Jika tidak ada di cookie, cek di header Authorization
    const authHeader = req.headers['authorization'];
    if (!token && authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // Jika ada JWT token (dari cookie atau header)
    if (token) {
      try {
        const decoded = jwtHelper.verifyAccessToken(token);
        req.user = decoded;
        return next();
      } catch (err) {
        return res.status(401).json({
          success: false,
          message: 'Access token tidak valid atau telah kedaluwarsa. Silakan refresh token atau login kembali.'
        });
      }
    }

    // Cek metode x-api-key
    const apiKey = req.headers['x-api-key'];
    if (apiKey) {
      const user = await prisma.user.findUnique({
        where: { apiKey }
      });

      if (!user || user.status !== 'ACTIVE') {
        return res.status(401).json({
          success: false,
          message: 'API Key tidak valid atau akun dinonaktifkan'
        });
      }

      req.user = {
        id: user.id,
        username: user.username,
        role: user.role,
        appName: user.appName
      };
      return next();
    }

    // Jika tidak ada sama sekali
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak! Anda harus login terlebih dahulu (menggunakan HttpOnly Cookie) atau menyertakan header x-api-key.'
    });
  } catch (error) {
    console.error('[AUTH MIDDLEWARE ERROR]', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal memvalidasi otentikasi',
      error: error.message
    });
  }
}

module.exports = authMiddleware;
