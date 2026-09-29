require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Konfigurasi BKN WSO2 Gateway
  bknBaseUrl: process.env.BKN_BASE_URL || 'https://apimws.bkn.go.id:8243/apisiasn/1.0',
  bknOauth2Url: process.env.BKN_OAUTH2_URL || 'https://apimws.bkn.go.id/oauth2/token',
  consumerKey: process.env.BKN_CONSUMER_KEY || '',
  consumerSecret: process.env.BKN_CONSUMER_SECRET || '',

  // Konfigurasi BKN SSO
  ssoUrl: process.env.BKN_SSO_URL || 'https://sso-siasn.bkn.go.id/auth/realms/public-siasn/protocol/openid-connect/token',
  ssoClientId: process.env.BKN_SSO_CLIENT_ID || 'konaweselatanws',
  ssoUsername: process.env.BKN_SSO_USERNAME || '',
  ssoPassword: process.env.BKN_SSO_PASSWORD || '',
  ssoMode: process.env.BKN_SSO_MODE || 'manual', // 'manual' atau 'auto'
  
  // Token SSO BKN Statis / Manual dari .env
  tokenAuthManual: process.env.TOKEN_AUTHx || ''
};
