import { FastifyReply, FastifyRequest } from 'fastify';
import { UserService } from './user.service';
import { UserDto } from './auth.types';

export class UserController {
  constructor(private readonly userService: UserService) {}

  async findById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<void> {
    const user = await this.userService.findById(request.params.id);
    return user ? reply.code(200).send(user as UserDto) : reply.code(404).send();
  }
}
