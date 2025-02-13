import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthorizationError, AuthRequest } from './auth.types';
import { LoggerService } from '../../common';
import { AuthService } from './auth.service';

export class AuthController {
  private logger = LoggerService.getLogger('feature.auth.AuthController');

  constructor(private readonly authService: AuthService) {}

  async login(request: FastifyRequest<{ Body: AuthRequest }>, reply: FastifyReply): Promise<void> {
    this.logger.info('Login request received', { email: request.body.email, password: '***' });
    try {
      const response = await this.authService.login(request.body);
      reply.code(200).send(response);
    } catch (error) {
      if (error instanceof AuthorizationError) {
        reply.code(401).send();
      }
      this.logger.error('Error during login', error);
      reply.code(400).send('Bad Request');
    }
  }
}
