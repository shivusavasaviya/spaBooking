const LOG_LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
const currentLevel = process.env.NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;

class Logger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000;
  }

  _log(level, message, data) {
    if (level < currentLevel) return;
    const entry = {
      timestamp: new Date().toISOString(),
      level: Object.keys(LOG_LEVELS)[level],
      message,
      data
    };
    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) this.logs.pop();

    const styles = {
      DEBUG: 'color: gray',
      INFO: 'color: blue',
      WARN: 'color: orange',
      ERROR: 'color: red; font-weight: bold'
    };
  }

  debug(message, data) { this._log(LOG_LEVELS.DEBUG, message, data); }
  info(message, data) { this._log(LOG_LEVELS.INFO, message, data); }
  warn(message, data) { this._log(LOG_LEVELS.WARN, message, data); }
  error(message, data) { this._log(LOG_LEVELS.ERROR, message, data); }

  getLogs() { return this.logs; }
  clearLogs() { this.logs = []; }
}

export const logger = new Logger();