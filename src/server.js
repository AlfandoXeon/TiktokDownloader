const http = require('http');
const App = require('./app');
const config = require('./config/Config');

class Server {
  #httpServer;
  #port;

  constructor() {
    const appInstance = new App().getExpressInstance();
    this.#port = config.get('port');
    this.#httpServer = http.createServer(appInstance);
  }

  start() {
    this.#httpServer.listen(this.#port, () => {
      //console.log('====================================================');
      console.log(`Server berjalan di : http://localhost:${this.#port}`);
      console.log(`Environment        : ${config.get('nodeEnv')}`);
      console.log('Arsitektur         : Node.js MVC + OOP');
     // console.log('====================================================');
    });

    process.on('SIGINT', () => this.#shutdown('SIGINT'));
    process.on('SIGTERM', () => this.#shutdown('SIGTERM'));
  }

  #shutdown(signal) {
    console.log(`\n[${signal}] Menutup server secara aman...`);
    this.#httpServer.close(() => {
      console.log('Server berhasil dihentikan.');
      process.exit(0);
    });
  }
}

const server = new Server();
server.start();
