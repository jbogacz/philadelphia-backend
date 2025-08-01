import { FastifyReply, FastifyRequest } from 'fastify';
import { CampaignInsightService } from './campaign.insight.service';
import { InsightService } from './insight.service';
import { CampaignInsightDto, InsightsOverviewDto, InsightsQueryDto } from './insight.type';

export class InsightController {
  constructor(private readonly insightService: InsightService, private readonly campaignInsightsService: CampaignInsightService) {}

  async fetchInsights(
    request: FastifyRequest<{ Querystring: InsightsQueryDto }>,
    reply: FastifyReply
  ): Promise<
    FastifyReply<{
      Reply: InsightsOverviewDto;
    }>
  > {
    const insights = await this.insightService.calculateInsights(request.query);
    return reply.code(200).send(insights);
  }

  async fetchCampaignInsights(
    request: FastifyRequest<{ Params: { campaignId: string } }>,
    reply: FastifyReply
  ): Promise<
    FastifyReply<{
      Reply: CampaignInsightDto;
    }>
  > {
    const insights = await this.campaignInsightsService.calculateInsights(request.params.campaignId);
    return reply.code(200).send(insights);
  }
}
