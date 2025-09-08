// Logging Middleware - Mandatory requirement
class Logger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000; // Prevent memory overflow
  }

  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data,
      id: Date.now() + Math.random()
    };
    
    this.logs.unshift(logEntry);
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }
    
    // Store in localStorage for persistence
    try {
      localStorage.setItem('app_logs', JSON.stringify(this.logs.slice(0, 100)));
    } catch (e) {
      // Handle localStorage quota exceeded
    }
  }

  info(message, data = null) {
    this.log('INFO', message, data);
  }

  warn(message, data = null) {
    this.log('WARN', message, data);
  }

  error(message, data = null) {
    this.log('ERROR', message, data);
  }

  debug(message, data = null) {
    this.log('DEBUG', message, data);
  }

  getLogs(level = null, limit = 50) {
    let filteredLogs = this.logs;
    
    if (level) {
      filteredLogs = this.logs.filter(log => log.level === level);
    }
    
    return filteredLogs.slice(0, limit);
  }

  clearLogs() {
    this.logs = [];
    localStorage.removeItem('app_logs');
  }

  // Load logs from localStorage on initialization
  loadPersistedLogs() {
    try {
      const storedLogs = localStorage.getItem('app_logs');
      if (storedLogs) {
        this.logs = JSON.parse(storedLogs);
      }
    } catch (e) {
      this.error('Failed to load persisted logs', e);
    }
  }
}

// Create singleton instance
const logger = new Logger();
logger.loadPersistedLogs();

export default logger;
