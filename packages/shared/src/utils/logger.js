const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

class Logger {
  constructor(context = 'App') {
    this.context = context;
  }

  formatMessage(level, message, meta = {}) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      context: this.context,
      message,
      ...meta
    });
  }

  error(message, meta) {
    console.error(this.formatMessage(LOG_LEVELS.ERROR, message, meta));
  }

  warn(message, meta) {
    console.warn(this.formatMessage(LOG_LEVELS.WARN, message, meta));
  }

  info(message, meta) {
    console.log(this.formatMessage(LOG_LEVELS.INFO, message, meta));
  }

  debug(message, meta) {
    if (process.env.NODE_ENV === 'development') {
      console.log(this.formatMessage(LOG_LEVELS.DEBUG, message, meta));
    }
  }
}

export function createLogger(context) {
  return new Logger(context);
}

export default new Logger();
