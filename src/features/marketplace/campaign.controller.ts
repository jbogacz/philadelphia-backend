import { FastifyReply, FastifyRequest } from 'fastify';
import { CampaignService } from './campaign.service';
import { CampaignDto, CampaignQueryDto } from './marketplace.types';
import { ErrorDto } from '../../common/errors';
import { AppConfig } from '../../app.types';
import { getAuth } from '@clerk/fastify';

export class CampaignController {
  constructor(private readonly campaignService: CampaignService, private readonly config: AppConfig) {}

  async update(
    request: FastifyRequest<{ Params: { id: string }; Body: CampaignDto }>,
    reply: FastifyReply
  ): Promise<
    FastifyReply<{
      Reply: CampaignDto | ErrorDto;
    }>
  > {
    const userId = this.config.isDevelopment() ? request.headers['x-user-id'] : getAuth(request).userId;
    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized', code: 401 });
    }

    const campaignId = request.params.id;
    const updated = await this.campaignService.update(campaignId, request.body, userId as string);
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
    const userId = this.config.isDevelopment() ? request.headers['x-user-id'] : getAuth(request).userId;
    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized', code: 401 });
    }

    const campaigns = await this.campaignService.query(request.query, userId as string);
    return reply.code(200).send(campaigns);
  }

  async findById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<
    FastifyReply<{
      Reply: CampaignDto | ErrorDto;
    }>
  > {
    const userId = this.config.isDevelopment() ? request.headers['x-user-id'] : getAuth(request).userId;
    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized', code: 401 });
    }

    const campaign = await this.campaignService.findById(request.params.id);
    if (!campaign) {
      return reply.code(404).send({ error: 'Campaign not found', code: 404 });
    }
    if (campaign.providerId !== userId && campaign.seekerId !== userId) {
      return reply.code(403).send({ error: 'Forbidden', code: 403 });
    }
    return reply.code(200).send(campaign);
  }
}
