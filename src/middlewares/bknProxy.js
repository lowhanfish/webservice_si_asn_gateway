const axios = require('axios');
const config = require('../config/bkn.config');
const tokenService = require('../services/tokenService');

/**
 * Controller / Proxy Handler untuk meneruskan request ke API SIASN BKN
 */
async function bknProxyHandler(req, res, next) {
  // Ambil sub-path setelah prefix route (misal /apisiasn/1.0 atau /api)
  let targetPath = req.originalUrl;
  if (targetPath.startsWith('/apisiasn/1.0')) {
    targetPath = targetPath.replace(/^\/apisiasn\/1.0/, '');
  } else if (targetPath.startsWith('/api')) {
    targetPath = targetPath.replace(/^\/api/, '');
  }

  // Buat URL tujuan penuh ke BKN
  // Hilangkan query string dari targetPath jika ada, karena axios params akan menangani query
  const [cleanPath] = targetPath.split('?');
  const targetUrl = `${config.bknBaseUrl}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;

  // Fungsi internal untuk eksekusi request ke BKN (dengan retry 1x jika 401)
  async function executeRequest(isRetry = false) {
    const wso2Token = await tokenService.getWso2Token();
    const authToken = await tokenService.getAuthToken();

    // Susun header
    const headers = {
      'Authorization': wso2Token,
      'Auth': authToken,
      'Accept': req.headers['accept'] || 'application/json'
    };

    const contentType = req.headers['content-type'];
    const isMultipart = contentType && contentType.includes('multipart/form-data');

    if (contentType) {
      headers['Content-Type'] = contentType;
    }

    const axiosConfig = {
      method: req.method,
      url: targetUrl,
      params: req.query,
      headers: headers,
      validateStatus: () => true, // Jangan throw error untuk status 4xx/5xx agar respon BKN diteruskan utuh
      responseType: 'stream',     // Mendukung response JSON maupun download dokumen binary (PDF)
      timeout: 60000              // 60 detik timeout untuk upload/download dokumen
    };

    // Tentukan body data
    if (isMultipart) {
      // Untuk upload file multipart/form-data, teruskan stream request langsung
      axiosConfig.data = req;
      axiosConfig.maxBodyLength = Infinity;
      axiosConfig.maxContentLength = Infinity;
    } else if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method.toUpperCase())) {
      axiosConfig.data = req.body;
    }

    const bknResponse = await axios(axiosConfig);

    // Jika BKN mengembalikan 401 Unauthorized dan belum pernah retry, refresh token dan coba lagi
    if (bknResponse.status === 401 && !isRetry) {
      console.warn('[GATEWAY] Mendapat status 401 dari BKN, me-refresh token WSO2 dan mencoba ulang...');
      tokenService.invalidateWso2Token();
      return await executeRequest(true);
    }

    return bknResponse;
  }

  try {
    const bknResponse = await executeRequest();

    // Teruskan status HTTP
    res.status(bknResponse.status);

    // Teruskan header penting dari BKN ke klien
    const forwardHeaders = ['content-type', 'content-disposition', 'content-length'];
    forwardHeaders.forEach(headerName => {
      const val = bknResponse.headers[headerName];
      if (val) {
        res.setHeader(headerName, val);
      }
    });

    // Pipe stream response BKN langsung ke klien
    bknResponse.data.pipe(res);
  } catch (error) {
    console.error('[GATEWAY ERROR]', error.message);
    if (!res.headersSent) {
      res.status(502).json({
        success: false,
        message: 'Gagal terhubung ke gateway BKN SIASN',
        error: error.message
      });
    }
  }
}

module.exports = bknProxyHandler;
