const { AppError } = require('../errors/AppError');
const config = require('../config/Config');

class ErrorMiddleware {
  static handle(err, req, res, next) {
    const isOperational = err instanceof AppError;
    const statusCode = isOperational ? err.statusCode : 500;
    const errorCode = isOperational ? err.errorCode : 'INTERNAL_SERVER_ERROR';
    const message = isOperational
      ? err.message
      : 'An internal server error occurred.';

    if (!isOperational || config.get('nodeEnv') === 'development') {
      console.error(`[ErrorMiddleware] ${err.name}: ${err.message}`);
    }

    // Render 404 HTML page for browser requests
    const isApiRequest = req.originalUrl.startsWith('/api') || req.xhr;
    if (statusCode === 404 && !isApiRequest && req.accepts('html')) {
      return res.status(404).render('404', {
        title: '404 - Page Not Found | TikTok Downloader',
        url: req.originalUrl
      });
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
