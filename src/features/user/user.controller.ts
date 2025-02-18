import { FastifyReply, FastifyRequest } from 'fastify';
import { User, UserDto } from './user.types';
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
    const user = await this.userService.findById(request.params.id);
    return user ? reply.code(200).send(user as UserDto) : reply.code(404).send();
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

  async update(
    request: FastifyRequest<{ Body: UserDto }>,
    reply: FastifyReply
  ): Promise<
    FastifyReply<{
      Reply: UserDto | { error: 'User not found'; code: 404 };
    }>
  > {
    const user = await this.userService.update(request.body);
    return reply.code(200).send(user);
  }
}
