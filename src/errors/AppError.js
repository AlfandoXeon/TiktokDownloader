class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Input tidak valid.') {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Video TikTok tidak ditemukan atau bersifat privat.') {
    super(message, 404, 'VIDEO_NOT_FOUND');
  }
}

class UpstreamError extends AppError {
  constructor(message = 'Gagal mengambil data dari server upstream TikTok.') {
    super(message, 502, 'UPSTREAM_ERROR');
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Terlalu banyak permintaan. Silakan coba beberapa saat lagi.') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UpstreamError,
  RateLimitError
};
