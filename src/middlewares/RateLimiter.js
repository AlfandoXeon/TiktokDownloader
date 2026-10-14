const { RateLimitError } = require('../errors/AppError');

class RateLimiter {
  #windowMs;
  #maxRequests;
  #clients;

  constructor(windowMs = 60000, maxRequests = 20) {
    this.#windowMs = windowMs;
    this.#maxRequests = maxRequests;
    this.#clients = new Map();

    // Bersihkan record yang sudah kedaluwarsa setiap 1 menit
    setInterval(() => this.#cleanup(), 60000).unref();
  }

  #cleanup() {
    const now = Date.now();
    for (const [ip, timestamps] of this.#clients.entries()) {
      const valid = timestamps.filter((ts) => now - ts < this.#windowMs);
      if (valid.length === 0) {
        this.#clients.delete(ip);
      } else {
        this.#clients.set(ip, valid);
      }
    }
  }

  handle = (req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const timestamps = this.#clients.get(ip) || [];

    const recentRequests = timestamps.filter((ts) => now - ts < this.#windowMs);

    if (recentRequests.length >= this.#maxRequests) {
      return next(new RateLimitError());
    }

    recentRequests.push(now);
    this.#clients.set(ip, recentRequests);
    next();
  };
}

module.exports = RateLimiter;
