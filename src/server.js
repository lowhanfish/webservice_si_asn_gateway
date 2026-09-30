require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const config = require('./config/bkn.config');
const tokenService = require('./services/tokenService');
const apiRoutes = require('./routes');
const authRoutes = require('./modules/auth/auth.routes');
const authMiddleware = require('./middlewares/authMiddleware');
const auditLogMiddleware = require('./middlewares/auditLogMiddleware');
const swaggerDocument = require('./docs/swagger.json');

const app = express();

// Middleware Global
app.use(cors({
  origin: true, // Mengizinkan domain pemanggil dinamis
  credentials: true // Mengizinkan pengiriman HttpOnly Cookie antar domain/port
}));
app.use(morgan('dev'));
app.use(cookieParser());

// Body Parser untuk JSON & URL-Encoded (multipart dilewatkan langsung sebagai stream)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Middleware Audit Trail / History Logging ke Database MySQL
app.use(auditLogMiddleware);

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
    health: '/health',
    auth: {
      register: 'POST /auth/register',
      login: 'POST /auth/login',
      refresh: 'POST /auth/refresh',
      logout: 'POST /auth/logout',
      profile: 'GET /auth/me',
      logs: 'GET /auth/logs'
    }
  });
});

// Swagger UI Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/docs', (req, res) => res.redirect('/api-docs'));

// Modul Autentikasi Pengguna Gateway (Publik)
app.use('/auth', authRoutes);

// Pendaftaran Modular Routes BKN (Dilindungi oleh Auth Middleware: HttpOnly Cookie atau x-api-key)
app.use('/apisiasn/1.0', authMiddleware, apiRoutes);
app.use('/api', authMiddleware, apiRoutes);

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
    console.log(`🔐 Auth Endpoints:       http://localhost:${config.port}/auth/login`);
    console.log(`🎯 Base Proxy:           http://localhost:${config.port}/apisiasn/1.0/`);
    console.log(`==================================================`);
  });
}

module.exports = app;
