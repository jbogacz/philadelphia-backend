import { FastifyReply, FastifyRequest } from 'fastify';
import { DemandDto } from './marketplace.types';
import { ErrorDto } from '../../common/errors';
import { AppConfig } from '../../app.types';
import { getAuth } from '@clerk/fastify';
import { DemandService } from './demand.service';

export class DemandController {
  constructor(private readonly demandService: DemandService, private readonly config: AppConfig) {}

  async create(
    request: FastifyRequest<{ Body: DemandDto }>,
    reply: FastifyReply
  ): Promise<
    FastifyReply<{
      Reply: DemandDto | ErrorDto;
    }>
  > {
    const userId = this.config.isDevelopment() ? request.headers['x-user-id'] : getAuth(request).userId;
    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized', code: 401 });
    }

    const created = await this.demandService.create({ ...request.body, userId: userId as string });
    return reply.code(201).send(created);
  }

  async update(
    request: FastifyRequest<{ Params: { id: string }; Body: DemandDto }>,
    reply: FastifyReply
  ): Promise<
    FastifyReply<{
      Reply: DemandDto | ErrorDto;
    }>
  > {
    const userId = this.config.isDevelopment() ? request.headers['x-user-id'] : getAuth(request).userId;
    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized', code: 401 });
    }
    const demandId = request.params.id;
    const demand = await this.demandService.update(demandId, { ...request.body, userId: userId as string });
    if (!demand) {
      return reply.code(404).send({ error: 'NotFoundError', message: 'Demand not found: ' + demandId, code: 404 });
    }
    return reply.code(200).send(demand);
  }

  async findAllByUserId(
    request: FastifyRequest<{}>,
    reply: FastifyReply
  ): Promise<
    FastifyReply<{
      Reply: DemandDto[] | ErrorDto;
    }>
  > {
    const userId = this.config.isDevelopment() ? request.headers['x-user-id'] : getAuth(request).userId;
    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized', code: 401 });
    }

    const demands = await this.demandService.findAllByUserId(userId as string);
    return reply.code(200).send(demands);
  }
}
