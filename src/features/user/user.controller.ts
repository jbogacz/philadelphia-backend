import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthRequest } from './user.types';

export class UserController {
  async login(
    request: FastifyRequest<{ Querystring: AuthRequest }>,
    reply: FastifyReply,
  ): Promise<void> {
    reply.code(200).send();
  }
}
