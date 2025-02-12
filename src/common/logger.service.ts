import { FastifyInstance } from 'fastify';

export class LoggerService {
  private static logger: FastifyInstance['log'];
  private className: string;

  constructor(className: string) {
    this.className = className;
  }

  static initialize(fastifyLogger: FastifyInstance['log']) {
    if (LoggerService.logger) {
      throw new Error('Logger already initialized');
    }
    LoggerService.logger = fastifyLogger;
  }

  static getLogger(className: string) {
    return new LoggerService(className);
  }

  info(message: string, data?: object) {
    // Include only data if provided
    LoggerService.logger.info(
      data || {}, // Just pass data or empty object
      `[${this.className}] ${message}` // Prefix message with className
    );
  }

  warn(message: string, data?: object) {
    LoggerService.logger.warn(data || {}, `[${this.className}] ${message}`);
  }

  debug(message: string, data?: object) {
    LoggerService.logger.debug(data || {}, `[${this.className}] ${message}`);
  }

  error(message: string, error?: unknown) {
    LoggerService.logger.error(
      {
        error: error || undefined,
      },
      `[${this.className}] ${message}`
    );
  }
}
