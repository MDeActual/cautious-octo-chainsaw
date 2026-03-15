import winston from 'winston';

export interface LogContext {
  tenantId?: string;
  userId?: string;
  requestId?: string;
  service?: string;
  [key: string]: unknown;
}

export interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
  child(defaultContext: LogContext): Logger;
}

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

function buildFormat(): winston.Logform.Format {
  if (process.env['NODE_ENV'] === 'development') {
    return winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'HH:mm:ss' }),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
        return `${String(timestamp)} [${level}] ${String(message)}${metaStr}`;
      }),
    );
  }

  return winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  );
}

class WinstonLogger implements Logger {
  private readonly winstonLogger: winston.Logger;
  private readonly defaultContext: LogContext;

  constructor(winstonLogger: winston.Logger, defaultContext: LogContext = {}) {
    this.winstonLogger = winstonLogger;
    this.defaultContext = defaultContext;
  }

  debug(message: string, context?: LogContext): void {
    this.winstonLogger.debug(message, { ...this.defaultContext, ...context });
  }

  info(message: string, context?: LogContext): void {
    this.winstonLogger.info(message, { ...this.defaultContext, ...context });
  }

  warn(message: string, context?: LogContext): void {
    this.winstonLogger.warn(message, { ...this.defaultContext, ...context });
  }

  error(message: string, context?: LogContext): void {
    this.winstonLogger.error(message, { ...this.defaultContext, ...context });
  }

  child(defaultContext: LogContext): Logger {
    return new WinstonLogger(this.winstonLogger, {
      ...this.defaultContext,
      ...defaultContext,
    });
  }
}

export function createLogger(service: string, defaultContext: LogContext = {}): Logger {
  const level = process.env['LOG_LEVEL'] ?? 'info';

  const winstonLogger = winston.createLogger({
    levels,
    level,
    format: buildFormat(),
    transports: [new winston.transports.Console()],
    defaultMeta: { service, ...defaultContext },
  });

  return new WinstonLogger(winstonLogger, { service, ...defaultContext });
}
