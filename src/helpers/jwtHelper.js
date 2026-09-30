const jwt = require('jsonwebtoken');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'default_access_secret_key_2026';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default_refresh_secret_key_2026';
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES_IN || '1h';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

const isProduction = process.env.NODE_ENV === 'production' && process.env.COOKIE_SECURE === 'true';

class JwtHelper {
  generateAccessToken(payload) {
    return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });
  }

  generateRefreshToken(payload) {
    return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });
  }

  verifyAccessToken(token) {
    return jwt.verify(token, ACCESS_SECRET);
  }

  verifyRefreshToken(token) {
    return jwt.verify(token, REFRESH_SECRET);
  }

  /**
   * Menaruh token ke dalam HttpOnly Cookie yang aman dari serangan XSS
   */
  setAuthCookies(res, accessToken, refreshToken) {
    // Cookie Access Token (1 jam)
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000 // 1 jam
    });

    // Cookie Refresh Token (7 hari)
    if (refreshToken) {
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 hari
      });
    }
  }

  /**
   * Menghapus HttpOnly Cookie saat logout
   */
  clearAuthCookies(res) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax'
    });
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax'
    });
  }
}

module.exports = new JwtHelper();
