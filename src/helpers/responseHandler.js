/**
 * Helper untuk penanganan respon dan error terstandar
 */
class ResponseHandler {
  success(res, data = null, statusCode = 200) {
    return res.status(statusCode).json(data);
  }

  error(res, message = 'Terjadi kesalahan pada gateway', statusCode = 500, errorDetail = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      error: errorDetail
    });
  }
}

module.exports = new ResponseHandler();
