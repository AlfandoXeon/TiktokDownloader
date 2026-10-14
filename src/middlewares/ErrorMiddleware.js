const { AppError } = require('../errors/AppError');
const config = require('../config/Config');

class ErrorMiddleware {
  static handle(err, req, res, next) {
    const isOperational = err instanceof AppError;
    const statusCode = isOperational ? err.statusCode : 500;
    const errorCode = isOperational ? err.errorCode : 'INTERNAL_SERVER_ERROR';
    const message = isOperational
      ? err.message
      : 'Terjadi kesalahan internal pada server.';

    if (!isOperational || config.get('nodeEnv') === 'development') {
      console.error(`[ErrorMiddleware] ${err.name}: ${err.message}`);
    }

    res.status(statusCode).json({
      success: false,
      error: {
        code: errorCode,
        message
      }
    });
  }
}

module.exports = ErrorMiddleware;
