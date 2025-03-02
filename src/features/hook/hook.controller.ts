import { FastifyReply, FastifyRequest } from 'fastify';
import { AppConfig } from '../../app.types';
import { HookService } from './hook.service';
import { HookDto, HookUpdateDto } from './hook.types';
import { ErrorDto } from '../../common/errors';
import { getAuth } from '@clerk/fastify';

export class HookController {
  constructor(private readonly hookService: HookService, private readonly config: AppConfig) {}

  async findById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<
    FastifyReply<{
      Reply: HookDto | ErrorDto;
    }>
  > {
    const hook: HookDto | null = await this.hookService.findById(request.params.id);
    return hook ? reply.code(200).send(hook) : reply.code(404).send({ error: 'NotFoundError', code: 404 });
  }

  async query(
    request: FastifyRequest<{ Querystring: HookDto }>,
    reply: FastifyReply
  ): Promise<
    FastifyReply<{
      Reply: HookDto[];
    }>
  > {
    const userId = this.config.isDevelopment() ? request.headers['x-user-id'] : getAuth(request).userId;
    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized', code: 401, message: 'User ID does not match' });
    }

    const hooks = await this.hookService.query({ ...request.query, userId: userId as string });
    return reply.code(200).send(hooks);
  }

  async create(
    request: FastifyRequest<{ Body: HookDto }>,
    reply: FastifyReply
  ): Promise<
    FastifyReply<{
      Reply: HookDto;
    }>
  > {
    const userId = this.config.isDevelopment() ? request.headers['x-user-id'] : getAuth(request).userId;
    if (userId != request.body.userId) {
      return reply.code(401).send({ error: 'Unauthorized', code: 401, message: 'User ID does not match' });
    }

    const hook = await this.hookService.create({ ...request.body });
    return reply.code(201).send(hook);
  }

  async update(
    request: FastifyRequest<{ Body: HookUpdateDto; Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<
    FastifyReply<{
      Reply: HookUpdateDto | ErrorDto;
    }>
  > {
    const hook = await this.hookService.update(request.params.id, request.body);
    return hook ? reply.code(200).send(hook) : reply.code(404).send({ error: 'NotFoundError', code: 404 });
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<
    FastifyReply<{
      Reply: HookDto | ErrorDto;
    }>
  > {
    await this.hookService.delete(request.params.id);
    return reply.code(204).send();
  }
}
