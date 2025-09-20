// ./utils/logger.js
class Logger {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  log(...args) {
    if (!this.isProduction) {
      console.log(...args);
    }
  }

  info(...args) {
    if (!this.isProduction) {
      console.info(...args);
    }
  }

  warn(...args) {
    if (!this.isProduction) {
      console.warn(...args);
    }
  }

  error(...args) {
    // Always show errors, even in production
    console.error(...args);
  }

  debug(...args) {
    if (!this.isProduction) {
      console.debug(...args);
    }
  }
}

module.exports = new Logger();