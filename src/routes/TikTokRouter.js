const express = require('express');

class TikTokRouter {
  #router;
  #controller;
  #rateLimiter;

  constructor(controller, rateLimiter) {
    this.#router = express.Router();
    this.#controller = controller;
    this.#rateLimiter = rateLimiter;
    this.#initializeRoutes();
  }

  #initializeRoutes() {
    // Web View Route
    this.#router.get('/', this.#controller.renderHome);

    // Health Check Route (For Cron Jobs, Uptime Monitors & Keep-Alive)
    this.#router.get('/health', this.#controller.getHealth);
    this.#router.get('/api/v1/health', this.#controller.getHealth);

    // REST API Routes
    this.#router.post(
      '/api/v1/tiktok/extract',
      this.#rateLimiter.handle,
      this.#controller.getVideoInfo
    );

    this.#router.get(
      '/api/v1/tiktok/download',
      this.#rateLimiter.handle,
      this.#controller.downloadMedia
    );

    this.#router.get(
      '/api/v1/tiktok/download-zip',
      this.#rateLimiter.handle,
      this.#controller.downloadPhotosZip
    );
  }

  getRouter() {
    return this.#router;
  }
}

module.exports = TikTokRouter;
