import { getAuth } from '@clerk/fastify';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AppConfig } from '../../app.types';
import { ErrorDto } from '../../common/errors';
import { CampaignService } from './campaign.service';
import { CampaignDateProposalDto, CampaignDto, CampaignQueryDto } from './marketplace.types';
import { startOfDay } from 'date-fns/startOfDay';

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

  async proposeStartDate(
    request: FastifyRequest<{ Params: { id: string }; Body: { startDate: Date } }>,
    reply: FastifyReply
  ): Promise<
    FastifyReply<{
      Reply: CampaignDateProposalDto | ErrorDto;
    }>
  > {
    const userId = this.config.isDevelopment() ? request.headers['x-user-id'] : getAuth(request).userId;
    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized', code: 401 });
    }
    const campaignId = request.params.id;
    const startDate = startOfDay(new Date(request.body.startDate));
    const proposition = await this.campaignService.proposeStartDate(campaignId, { startDate }, userId as string);

    return reply.code(200).send(proposition);
  }

  async respondToDateProposal(
    request: FastifyRequest<{ Params: { id: string }; Body: { status: 'accepted' | 'rejected' } }>,
    reply: FastifyReply
  ): Promise<
    FastifyReply<{
      Reply: { startDate: Date; status: 'pending' | 'accepted' | 'rejected' } | ErrorDto;
    }>
  > {
    const userId = this.config.isDevelopment() ? request.headers['x-user-id'] : getAuth(request).userId;
    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized', code: 401 });
    }
    const campaignId = request.params.id;
    const { status } = request.body;
    const proposition = await this.campaignService.respondToDateProposal(campaignId, { status }, userId as string);

    return reply.code(200).send(proposition);
  }
}
