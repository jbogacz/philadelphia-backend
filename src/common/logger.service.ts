import { FastifyInstance } from 'fastify';
import chalk from 'chalk';

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
    LoggerService.logger.info(data, `${chalk.blue(`(${this.className})`)} : ${message}`);
  }

  warn(message: string, data?: object) {
    LoggerService.logger.warn(data, `${chalk.yellow(`(${this.className})`)} : ${message}`);
  }

  debug(message: string, data?: object) {
    LoggerService.logger.debug(data, `${chalk.gray(`(${this.className})`)} : ${message}`);
  }

  error(message: string, error?: unknown) {
    if (error) {
      LoggerService.logger.error(message, error, `${chalk.red(`(${this.className})`)} : ${message}`);
    } else {
      LoggerService.logger.error(message, `${chalk.red(`(${this.className})`)} : ${message}`);
    }
  }
}
