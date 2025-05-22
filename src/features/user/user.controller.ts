import { FastifyReply, FastifyRequest } from 'fastify';
import { UserDto } from './user.types';
import { UserService } from './user.service';

export class UserController {
  constructor(private readonly userService: UserService) {}

  async findById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<
    FastifyReply<{
      Reply: UserDto | { error: 'User not found'; code: 404 };
    }>
  > {
    const user = await this.userService.findByUserId(request.params.id);
    if (!user) {
      return reply.code(404).send({ error: 'User not found', code: 404 });
    }
    return reply.code(200).send(user as UserDto);
  }

  async register(
    request: FastifyRequest<{ Body: UserDto }>,
    reply: FastifyReply
  ): Promise<
    FastifyReply<{
      Reply: UserDto;
    }>
  > {
    const user = await this.userService.register(request.body);
    return reply.code(201).send(user);
  }
}
