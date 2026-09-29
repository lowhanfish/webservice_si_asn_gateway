require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const config = require('./config/bkn.config');
const tokenService = require('./services/tokenService');
const apiRoutes = require('./routes');
const swaggerDocument = require('./docs/swagger.json');

const app = express();

// Middleware Global
app.use(cors());
app.use(morgan('dev'));

// Body Parser untuk JSON & URL-Encoded (multipart dilewatkan langsung sebagai stream)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check Gateway
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

// Root Gateway Info
app.get('/', (req, res) => {
  res.json({
    name: 'Webservice SI-ASN Gateway',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/health'
  });
});

// Swagger UI Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/docs', (req, res) => res.redirect('/api-docs'));

// Pendaftaran Modular Routes (NestJS style)
app.use('/apisiasn/1.0', apiRoutes);
app.use('/api', apiRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  if (!res.headersSent) {
    res.status(500).json({
      success: false,
      message: err.message || 'Terjadi kesalahan internal pada gateway'
    });
  }
});

// Start Server
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
