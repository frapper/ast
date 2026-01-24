import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const logDir = path.join(__dirname, '../logs')

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
)

// Console format with colors
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`
    }
    return msg
  })
)

// Create daily rotate file transport for errors
const errorTransport = new DailyRotateFile({
  filename: path.join(logDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxSize: '20m',
  maxFiles: '14d'
})

// Create daily rotate file transport for all logs
const combinedTransport = new DailyRotateFile({
  filename: path.join(logDir, 'combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d'
})

// Create the logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    errorTransport,
    combinedTransport
  ],
  exitOnError: false
})

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }))
}

// Logging helpers for different contexts
export const apiLogger = {
  request: (method: string, path: string, metadata?: Record<string, any>) => {
    logger.info(`API Request: ${method} ${path}`, metadata)
  },
  response: (method: string, path: string, statusCode: number, metadata?: Record<string, any>) => {
    logger.info(`API Response: ${method} ${path} - ${statusCode}`, metadata)
  },
  error: (method: string, path: string, error: Error, metadata?: Record<string, any>) => {
    logger.error(`API Error: ${method} ${path}`, { error: error.message, stack: error.stack, ...metadata })
  }
}

export const dbLogger = {
  query: (table: string, operation: string, metadata?: Record<string, any>) => {
    logger.info(`DB Query: ${operation} on ${table}`, metadata)
  },
  error: (table: string, operation: string, error: Error, metadata?: Record<string, any>) => {
    logger.error(`DB Error: ${operation} on ${table}`, { error: error.message, stack: error.stack, ...metadata })
  },
  success: (table: string, operation: string, metadata?: Record<string, any>) => {
    logger.info(`DB Success: ${operation} on ${table}`, metadata)
  }
}

export default logger
