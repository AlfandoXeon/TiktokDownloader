const path = require('path');
const express = require('express');
const cors = require('cors');
const config = require('./config/Config');
const TikWmExtractor = require('./services/TikWmExtractor');
const StreamService = require('./services/StreamService');
const TikTokController = require('./controllers/TikTokController');
const TikTokRouter = require('./routes/TikTokRouter');
const RateLimiter = require('./middlewares/RateLimiter');
const HtmlMinifierMiddleware = require('./middlewares/HtmlMinifierMiddleware');
const ErrorMiddleware = require('./middlewares/ErrorMiddleware');
const { AppError } = require('./errors/AppError');

class App {
  #expressApp;

  constructor() {
    this.#expressApp = express();
    this.#configureMiddlewares();
    this.#configureViewEngine();
    this.#configureRoutes();
    this.#configureErrorHandling();
  }

  #configureMiddlewares() {
    this.#expressApp.use(cors());
    this.#expressApp.use(express.json({ limit: '100kb' }));
    this.#expressApp.use(express.urlencoded({ extended: true, limit: '100kb' }));
    this.#expressApp.use(express.static(path.join(__dirname, '../public')));
  }

  #configureViewEngine() {
    this.#expressApp.set('views', path.join(__dirname, 'views'));
    this.#expressApp.set('view engine', 'ejs');

    const htmlMinifier = new HtmlMinifierMiddleware();
    this.#expressApp.use(htmlMinifier.handle);
  }

  #configureRoutes() {
    // Dependency Injection Setup
    const extractorService = new TikWmExtractor();
    const streamService = new StreamService();
    const tikTokController = new TikTokController(extractorService, streamService);
    const rateLimiter = new RateLimiter(
      config.get('rateLimitWindowMs'),
      config.get('rateLimitMaxRequests')
    );

    const tikTokRouter = new TikTokRouter(tikTokController, rateLimiter);
    this.#expressApp.use('/', tikTokRouter.getRouter());
  }

  #configureErrorHandling() {
    this.#expressApp.use((req, res, next) => {
      next(new AppError(`Endpoint ${req.originalUrl} tidak ditemukan.`, 404, 'ROUTE_NOT_FOUND'));
    });

    this.#expressApp.use(ErrorMiddleware.handle);
  }

  getExpressInstance() {
    return this.#expressApp;
  }
}

module.exports = App;
