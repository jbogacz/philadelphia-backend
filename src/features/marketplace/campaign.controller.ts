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
    const userId = this.config.isDevelopment() ? request.headers['x-user-id'] : getAuth(request).userId;
    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized', code: 401 });
    }

    const campaigns = await this.campaignService.query(userId as string, request.query);
    return reply.code(200).send(campaigns);
  }
}
