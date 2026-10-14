require('dotenv').config();

class Config {
  static #instance = null;
  #settings;

  constructor() {
    if (Config.#instance) {
      return Config.#instance;
    }

    this.#settings = Object.freeze({
      port: parseInt(process.env.PORT || '3000', 10),
      nodeEnv: process.env.NODE_ENV || 'development',
      tikwmApiBaseUrl: process.env.TIKWM_API_BASE_URL || 'https://www.tikwm.com/api/',
      requestTimeoutMs: parseInt(process.env.REQUEST_TIMEOUT_MS || '15000', 10),
      rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
      rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '20', 10),
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
    });

    Config.#instance = this;
  }

  static getInstance() {
    if (!Config.#instance) {
      Config.#instance = new Config();
    }
    return Config.#instance;
  }

  get(key) {
    return this.#settings[key];
  }
}

module.exports = Config.getInstance();
