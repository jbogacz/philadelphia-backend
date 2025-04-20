import { FastifyReply, FastifyRequest } from 'fastify';
import { CampaignService } from './campaign.service';
import { CampaignDto, CampaignQueryDto } from './marketplace.types';
import { ErrorDto } from '../../common/errors';

export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  async create(
    request: FastifyRequest<{ Body: CampaignDto }>,
    reply: FastifyReply
  ): Promise<
    FastifyReply<{
      Reply: CampaignDto | ErrorDto;
    }>
  > {
    const created = await this.campaignService.create(request.body);
    return reply.code(201).send(created);
  }

  async update(
    request: FastifyRequest<{ Params: { id: string }; Body: CampaignDto }>,
    reply: FastifyReply
  ): Promise<
    FastifyReply<{
      Reply: CampaignDto | ErrorDto;
    }>
  > {
    const campaignId = request.params.id;
    const updated = await this.campaignService.update(campaignId, request.body);
    return reply.code(200).send(updated);
  }

  async query(
    request: FastifyRequest<{ Querystring: CampaignQueryDto }>,
    reply: FastifyReply
  ): Promise<
    FastifyReply<{
      Reply: CampaignDto[] | ErrorDto;
    }>
  > {
    const campaigns = await this.campaignService.query(request.query);
    return reply.code(200).send(campaigns);
  }
}
