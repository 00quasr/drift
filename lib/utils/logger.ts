import winston from 'winston'

// Create a logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'drift-app' },
  transports: [
    // Write all logs with importance level of 'error' or less to 'error.log'
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // Write all logs with importance level of 'info' or less to 'combined.log'
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
})

// If we're not in production then log to the console with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }))
}

// Create a structured logger interface
export const log = {
  error: (message: string, meta?: any) => {
    logger.error(message, meta)
  },
  warn: (message: string, meta?: any) => {
    logger.warn(message, meta)
  },
  info: (message: string, meta?: any) => {
    logger.info(message, meta)
  },
  debug: (message: string, meta?: any) => {
    if (process.env.NODE_ENV !== 'production') {
      logger.debug(message, meta)
    }
  },
  // Security-specific logging
  security: (event: string, details?: any) => {
    logger.warn(`SECURITY: ${event}`, {
      type: 'security',
      ...details,
      timestamp: new Date().toISOString()
    })
  },
  // Authentication logging
  auth: (event: string, userId?: string, details?: any) => {
    logger.info(`AUTH: ${event}`, {
      type: 'auth',
      userId,
      ...details,
      timestamp: new Date().toISOString()
    })
  },
  // API request logging
  api: (method: string, path: string, status: number, duration?: number, userId?: string) => {
    logger.info(`API: ${method} ${path} ${status}`, {
      type: 'api',
      method,
      path,
      status,
      duration,
      userId,
      timestamp: new Date().toISOString()
    })
  }
}

// Development-only console replacement
export const devLog = {
  log: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(...args)
    }
  },
  error: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error(...args)
    }
  },
  warn: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(...args)
    }
  },
  info: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.info(...args)
    }
  }
}

export default logger