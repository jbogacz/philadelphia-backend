import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthRequest } from './auth.types';
import { randomUUID } from 'crypto';
import { LoggerService } from '../../common';

export class AuthController {
  private logger = LoggerService.getLogger('feature.ad.AdController');

  async login(request: FastifyRequest<{ Body: AuthRequest }>, reply: FastifyReply): Promise<void> {
    this.logger.info('Login request received', request.body);
    reply.code(200).send({ token: randomUUID() });
  }
}
