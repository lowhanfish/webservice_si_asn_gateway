const prisma = require('../helpers/prisma');

/**
 * Middleware untuk mencatat riwayat akses (Audit Trail / Access History)
 * Merekam: endpoint, method, domain pemanggil, IP, statusCode, durasi respon, dan user ID
 */
function auditLogMiddleware(req, res, next) {
  const startTime = Date.now();

  res.on('finish', async () => {
    // Jangan catat request health check atau asset statis swagger agar DB tidak penuh sampah
    if (req.originalUrl === '/health' || req.originalUrl.startsWith('/api-docs/')) {
      return;
    }

    const executionTime = Date.now() - startTime;
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || 
                     req.socket?.remoteAddress || 
                     req.ip || null;

    // Ambil domain pemanggil dari header Origin atau Referer
    let domain = req.headers['origin'] || req.headers['referer'] || null;
    if (domain) {
      try {
        const parsedUrl = new URL(domain);
        domain = parsedUrl.hostname;
      } catch (e) {
        // Biarkan teks asli jika bukan format valid URL
      }
    }

    try {
      await prisma.apiAccessLog.create({
        data: {
          userId: req.user?.id || null,
          endpoint: req.originalUrl,
          method: req.method,
          domain: domain || req.headers['host'] || 'Direct / Server-to-Server',
          clientIp,
          statusCode: res.statusCode,
          executionTime,
          userAgent: req.headers['user-agent'] || null
        }
      });
    } catch (err) {
      console.error('[AUDIT LOG ERROR] Gagal menyimpan log akses:', err.message);
    }
  });

  next();
}

module.exports = auditLogMiddleware;
