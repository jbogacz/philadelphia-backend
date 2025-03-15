import { FastifyReply, FastifyRequest } from 'fastify';
import { InsightsOverviewDto, InsightsQueryDto } from './insight.type';
import { InsightService } from './insight.service';

export class InsightController {
  constructor(private readonly insightService: InsightService) {}

  async fetchInsights(
    request: FastifyRequest<{ Querystring: InsightsQueryDto }>,
    reply: FastifyReply
  ): Promise<
    FastifyReply<{
      Reply: InsightsOverviewDto;
    }>
  > {
    const insights = await this.insightService.fetchInsights(request.query);
    return reply.code(200).send(insights);
  }
}
