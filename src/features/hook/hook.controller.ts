import { FastifyReply, FastifyRequest } from 'fastify';
import { AppConfig } from '../../app.types';
import { HookService } from './hook.service';
import { HookDto } from './hook.types';
import { ErrorDto } from '../../common/errors';

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
    return hook ? reply.code(200).send(hook) : reply.code(404).send({ error: 'Hook not found', code: 404 });
  }

  async query(
    request: FastifyRequest<{ Querystring: HookDto }>,
    reply: FastifyReply
  ): Promise<
    FastifyReply<{
      Reply: HookDto[];
    }>
  > {
    const hooks = await this.hookService.query(request.query);
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
    const hook = await this.hookService.create(request.body);
    return reply.code(201).send(hook);
  }

  async update(
    request: FastifyRequest<{ Body: HookDto }>,
    reply: FastifyReply
  ): Promise<
    FastifyReply<{
      Reply: HookDto | ErrorDto;
    }>
  > {
    const hook = await this.hookService.update(request.body);
    return hook ? reply.code(200).send(hook) : reply.code(404).send({ error: 'Hook not found', code: 404 });
  }
}
