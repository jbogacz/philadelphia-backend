import { FastifyPluginAsync } from 'fastify';
import { CampaignInsightsQuerySchema, CampaignInsightsSchema, InsightsOverviewSchema, InsightsQuerySchema } from './insight.type';

export const insightRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    '/insights',
    {
      schema: {
        querystring: InsightsQuerySchema,
        description: 'Get insights overview',
        tags: ['insights'],
        response: {
          200: InsightsOverviewSchema,
        },
      },
    },
    fastify.controller.insight.fetchInsights.bind(fastify.controller.insight)
  );

  fastify.get(
    '/insights/campaign',
    {
      schema: {
        querystring: CampaignInsightsQuerySchema,
        description: 'Get campaign insights',
        tags: ['insights'],
        response: {
          200: CampaignInsightsSchema,
        },
      },
    },
    fastify.controller.insight.fetchCampaignInsights.bind(fastify.controller.insight)
  );
};
