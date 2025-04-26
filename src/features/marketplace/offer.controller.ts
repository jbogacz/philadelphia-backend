import { FastifyRequest, FastifyReply } from 'fastify';
import { AppConfig } from '../../app.types';
import { ErrorDto } from '../../common/errors';
import { OfferDto, OfferQueryDto } from './marketplace.types';
import { OfferService } from './offer.service';
import { getAuth } from '@clerk/fastify';

export class OfferController {
  constructor(private readonly offerService: OfferService, private readonly config: AppConfig) {}

  async create(
    request: FastifyRequest<{ Body: OfferDto }>,
    reply: FastifyReply
  ): Promise<
    FastifyReply<{
      Reply: OfferDto | ErrorDto;
    }>
  > {
    const userId = this.config.isDevelopment() ? request.headers['x-user-id'] : getAuth(request).userId;
    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized', code: 401 });
    }

    const created = await this.offerService.create({ ...request.body, providerId: userId as string });
    return reply.code(201).send(created);
  }

  async query(
    request: FastifyRequest<{ Querystring: OfferQueryDto }>,
    reply: FastifyReply
  ): Promise<
    FastifyReply<{
      Reply: OfferDto[] | ErrorDto;
    }>
  > {
    const userId = this.config.isDevelopment() ? request.headers['x-user-id'] : getAuth(request).userId;

    const { providerId, seekerId } = request.query;
    if ((providerId && providerId !== userId) || (seekerId && seekerId !== userId)) {
      return reply.code(401).send({ error: 'Unauthorized', code: 401 });
    }

    const offers = await this.offerService.query(request.query);
    return reply.code(200).send(offers);
  }

  async update(
    request: FastifyRequest<{ Params: { id: string }; Body: OfferDto }>,
    reply: FastifyReply
  ): Promise<
    FastifyReply<{
      Reply: OfferDto | ErrorDto;
    }>
  > {
    const userId = this.config.isDevelopment() ? request.headers['x-user-id'] : getAuth(request).userId;
    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized', code: 401 });
    }
    const offerId = request.params.id;
    const offer = await this.offerService.update(offerId, userId as string, request.body);
    if (!offer) {
      return reply.code(404).send({ error: 'NotFoundError', message: 'Offer not found: ' + offerId, code: 404 });
    }
    return reply.code(200).send(offer);
  }

  async findById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<
    FastifyReply<{
      Reply: OfferDto | ErrorDto;
    }>
  > {
    const offerId = request.params.id;
    const offer = await this.offerService.findById(offerId);
    if (!offer) {
      return reply.code(404).send({ error: 'NotFoundError', message: 'Offer not found: ' + offerId, code: 404 });
    }
    return reply.code(200).send(offer);
  }

  async delete(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<
    FastifyReply<{
      Reply: OfferDto | ErrorDto;
    }>
  > {
    const userId = this.config.isDevelopment() ? request.headers['x-user-id'] : getAuth(request).userId;
    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized', code: 401 });
    }
    const offerId = request.params.id;
    await this.offerService.delete(offerId, userId as string);
    return reply.code(204).send();
  }
}
