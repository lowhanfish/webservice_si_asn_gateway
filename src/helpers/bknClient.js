const axios = require('axios');
const config = require('../config/bkn.config');
const tokenService = require('../services/tokenService');

class BknClient {
  /**
   * Mengirim request langsung ke BKN dengan auto-inject token dan auto-retry 1x jika 401
   */
  async request({ method = 'GET', path = '', params = {}, data = null, headers = {}, responseType = 'json', isRetry = false }) {
    const wso2Token = await tokenService.getWso2Token();
    const authToken = await tokenService.getAuthToken();

    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const fullUrl = `${config.bknBaseUrl}${cleanPath}`;

    const requestHeaders = {
      'Authorization': wso2Token,
      'Auth': authToken,
      'Accept': 'application/json',
      ...headers
    };

    try {
      const response = await axios({
        method,
        url: fullUrl,
        params,
        data,
        headers: requestHeaders,
        responseType,
        validateStatus: () => true, // Jangan throw error untuk 4xx/5xx agar response BKN diteruskan utuh
        timeout: 60000
      });

      // Auto-retry jika token WSO2 hangus (401)
      if (response.status === 401 && !isRetry) {
        console.warn('[BKN CLIENT] Mendapat 401 dari BKN, merefresh token WSO2 dan mencoba ulang...');
        tokenService.invalidateWso2Token();
        return await this.request({ method, path, params, data, headers, responseType, isRetry: true });
      }

      return response;
    } catch (error) {
      throw new Error(`Koneksi ke Web Service BKN gagal: ${error.message}`);
    }
  }

  /**
   * Helper untuk meneruskan (forward) request Express langsung ke BKN
   * Mendukung streaming respon (PDF download) dan streaming upload (multipart/form-data)
   */
  async forward(req, res, targetPath = null, isRetry = false) {
    try {
      const wso2Token = await tokenService.getWso2Token();
      const authToken = await tokenService.getAuthToken();

      // Jika targetPath tidak ditentukan, gunakan path relatif dari route
      const cleanPath = targetPath || req.originalUrl.replace(/^\/(apisiasn\/1\.0|api)/, '');
      const fullUrl = `${config.bknBaseUrl}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath.split('?')[0]}`;

      const requestHeaders = {
        'Authorization': wso2Token,
        'Auth': authToken,
        'Accept': req.headers['accept'] || 'application/json'
      };

      const contentType = req.headers['content-type'];
      const isMultipart = contentType && contentType.includes('multipart/form-data');

      if (contentType) {
        requestHeaders['Content-Type'] = contentType;
      }

      const axiosConfig = {
        method: req.method,
        url: fullUrl,
        params: req.query,
        headers: requestHeaders,
        validateStatus: () => true,
        responseType: 'stream',
        timeout: 60000
      };

      if (isMultipart) {
        axiosConfig.data = req;
        axiosConfig.maxBodyLength = Infinity;
        axiosConfig.maxContentLength = Infinity;
      } else if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method.toUpperCase())) {
        axiosConfig.data = req.body;
      }

      const bknResponse = await axios(axiosConfig);

      if (bknResponse.status === 401 && !isRetry) {
        console.warn('[BKN FORWARD] Mendapat 401, merefresh token dan mencoba ulang...');
        tokenService.invalidateWso2Token();
        return await this.forward(req, res, targetPath, true);
      }

      res.status(bknResponse.status);

      const forwardHeaders = ['content-type', 'content-disposition', 'content-length'];
      forwardHeaders.forEach(headerName => {
        const val = bknResponse.headers[headerName];
        if (val) res.setHeader(headerName, val);
      });

      bknResponse.data.pipe(res);
    } catch (error) {
      console.error('[BKN FORWARD ERROR]', error.message);
      if (!res.headersSent) {
        res.status(502).json({
          success: false,
          message: 'Gagal menghubungi Web Service SI-ASN BKN',
          error: error.message
        });
      }
    }
  }
}

module.exports = new BknClient();
