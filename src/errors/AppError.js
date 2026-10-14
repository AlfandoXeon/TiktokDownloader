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
  constructor(message = 'Invalid input provided.') {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

class NotFoundError extends AppError {
  constructor(message = 'TikTok post was not found or the account is private.') {
    super(message, 404, 'POST_NOT_FOUND');
  }
}

class UpstreamError extends AppError {
  constructor(message = 'Failed to fetch media from upstream TikTok provider.') {
    super(message, 502, 'UPSTREAM_ERROR');
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Too many requests. Please slow down and try again in a few moments.') {
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
