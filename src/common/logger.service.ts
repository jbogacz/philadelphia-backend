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
    LoggerService.logger.info(
      {
        // className: this.className,
        ...(data || {}),
      },
      message,
    );
  }

  warn(message: string, data?: object) {
    LoggerService.logger.warn(
      {
        className: this.className,
        ...(data || {}),
      },
      message,
    );
  }

  debug(message: string, data?: object) {
    LoggerService.logger.debug(
      {
        className: this.className,
        ...(data || {}),
      },
      message,
    );
  }

  error(message: string, error?: unknown) {
    LoggerService.logger.error(
      {
        className: this.className,
        error: error || undefined,
      },
      message,
    );
  }
}
