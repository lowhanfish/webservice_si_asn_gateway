const axios = require('axios');
const config = require('../config/bkn.config');

class TokenService {
  constructor() {
    this.cachedWso2Token = null;
    this.wso2ExpiresAt = 0;

    this.cachedSsoToken = null;
    this.ssoExpiresAt = 0;
  }

  /**
   * Menghasilkan token Authorization (WSO2 BKN) dengan auto-refresh & cache in-memory.
   * Format header BKN: Authorization: Bearer <token_wso2>
   */
  async getWso2Token() {
    const now = Date.now();
    // Gunakan cache jika masih berlaku (dengan buffer keamanan 60 detik)
    if (this.cachedWso2Token && now < (this.wso2ExpiresAt - 60000)) {
      return this.cachedWso2Token;
    }

    if (!config.consumerKey || !config.consumerSecret) {
      throw new Error('BKN_CONSUMER_KEY dan BKN_CONSUMER_SECRET belum dikonfigurasi di file .env');
    }

    try {
      const basicAuth = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString('base64');
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');

      const response = await axios.post(config.bknOauth2Url, params.toString(), {
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 15000
      });

      const { access_token, expires_in } = response.data;
      if (!access_token) {
        throw new Error('Respon OAuth2 BKN tidak mengembalikan access_token');
      }

      this.cachedWso2Token = `Bearer ${access_token}`;
      this.wso2ExpiresAt = Date.now() + ((expires_in || 3600) * 1000);

      return this.cachedWso2Token;
    } catch (error) {
      const errorMsg = error.response?.data?.error_description || error.response?.data?.error || error.message;
      throw new Error(`Gagal mendapatkan token WSO2 BKN: ${errorMsg}`);
    }
  }

  /**
   * Menghasilkan token Auth (SSO Keycloak BKN).
   * Format header BKN: Auth: Bearer <token_sso> (atau 'bearer <token>')
   */
  async getAuthToken() {
    // Mode Auto: coba login programmatic jika dikonfigurasi
    if (config.ssoMode === 'auto') {
      const now = Date.now();
      if (this.cachedSsoToken && now < (this.ssoExpiresAt - 60000)) {
        return this.cachedSsoToken;
      }

      try {
        const params = new URLSearchParams();
        params.append('client_id', config.ssoClientId);
        params.append('grant_type', 'password');
        params.append('username', config.ssoUsername);
        params.append('password', config.ssoPassword);

        const response = await axios.post(config.ssoUrl, params.toString(), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 15000
        });

        const { access_token, expires_in } = response.data;
        if (access_token) {
          this.cachedSsoToken = `bearer ${access_token}`;
          this.ssoExpiresAt = Date.now() + ((expires_in || 1800) * 1000);
          return this.cachedSsoToken;
        }
      } catch (err) {
        console.warn('Gagal login SSO otomatis, beralih ke token manual TOKEN_AUTHx dari .env:', err.message);
      }
    }

    // Default / Fallback Mode: Menggunakan TOKEN_AUTHx dari .env
    const rawToken = config.tokenAuthManual?.trim() || '';
    if (!rawToken) {
      throw new Error('TOKEN_AUTHx belum diisi di file .env');
    }

    // Pastikan prefix 'bearer ' ada
    if (/^bearer\s+/i.test(rawToken)) {
      return rawToken;
    }
    return `bearer ${rawToken}`;
  }

  /**
   * Menghapus cache token jika BKN merespon dengan status 401 Unauthorized
   */
  invalidateWso2Token() {
    this.cachedWso2Token = null;
    this.wso2ExpiresAt = 0;
  }
}

module.exports = new TokenService();
