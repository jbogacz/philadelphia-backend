import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthRequest } from './auth.types';
import { randomUUID } from 'crypto';
import { LoggerService } from '../../common';

export class AuthController {
  private logger = LoggerService.getLogger('feature.auth.AuthController');

  async login(request: FastifyRequest<{ Body: AuthRequest }>, reply: FastifyReply): Promise<void> {
    this.logger.info('Login request received', { email: request.body.email, password: '***' });
    reply.code(200).send({ token: randomUUID(), user: { userId: '2137', email: request.body.email, role: 'user' } });
  }
}
