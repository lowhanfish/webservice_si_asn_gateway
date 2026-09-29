require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config/bkn.config');
const tokenService = require('./services/tokenService');
const bknProxyHandler = require('./middlewares/bknProxy');

const app = express();

// Middleware Umum
app.use(cors());
app.use(morgan('dev'));

// Body Parser untuk JSON & URL-Encoded (multipart/form-data dilewatkan sebagai stream)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check & Info Gateway
app.get('/health', async (req, res) => {
  try {
    const wso2 = await tokenService.getWso2Token();
    const auth = await tokenService.getAuthToken();
    res.json({
      status: 'online',
      gateway: 'Webservice SI-ASN Gateway BKN',
      timestamp: new Date().toISOString(),
      tokens: {
        wso2: wso2 ? 'OK' : 'Error',
        auth: auth ? 'OK' : 'Error'
      },
      docs: '/api-docs'
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

// Root route - redirect or info
app.get('/', (req, res) => {
  res.json({
    name: 'Webservice SI-ASN Gateway',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/health'
  });
});

// Swagger Docs (Placeholder, akan dimuat di Checkpoint 4)
try {
  const swaggerUi = require('swagger-ui-express');
  const swaggerDocument = require('./docs/swagger.json');
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.use('/docs', (req, res) => res.redirect('/api-docs'));
} catch (e) {
  // Jika file swagger belum dibuat, tampilkan notifikasi sederhana
  app.get('/api-docs', (req, res) => {
    res.send('Swagger Docs sedang disiapkan pada Checkpoint 4.');
  });
}

// Proxy Endpoint ke BKN SIASN
// Mendukung request melalui:
// 1. /apisiasn/1.0/... (sama persis dengan URL BKN asli)
// 2. /api/... (alias yang lebih ringkas)
app.use('/apisiasn/1.0', bknProxyHandler);
app.use('/api', bknProxyHandler);

// Start Server jika dipanggil langsung
if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`==================================================`);
    console.log(`🚀 Webservice SI-ASN Gateway running on port ${config.port}`);
    console.log(`📖 Swagger Documentation: http://localhost:${config.port}/api-docs`);
    console.log(`🩺 Health Check:         http://localhost:${config.port}/health`);
    console.log(`🎯 Base Proxy:           http://localhost:${config.port}/apisiasn/1.0/`);
    console.log(`==================================================`);
  });
}

module.exports = app;
