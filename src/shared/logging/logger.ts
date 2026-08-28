type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogPayload {
  [key: string]: any;
}

class Logger {
  private formatMessage(level: LogLevel, message: string, payload?: LogPayload) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] ${message} ${
      payload ? JSON.stringify(payload) : ''
    }`;
  }

  debug(message: string, payload?: LogPayload) {
    if (__DEV__) {
      console.log(this.formatMessage('debug', message, payload));
    }
  }

  info(message: string, payload?: LogPayload) {
    console.info(this.formatMessage('info', message, payload));
  }

  warn(message: string, payload?: LogPayload) {
    console.warn(this.formatMessage('warn', message, payload));
  }

  error(message: string, payload?: LogPayload) {
    console.error(this.formatMessage('error', message, payload));
  }
}

export const logger = new Logger();
