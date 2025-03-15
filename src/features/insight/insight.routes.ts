import { FastifyPluginAsync } from 'fastify';
import { InsightsOverviewSchema, InsightsQuerySchema } from './insight.type';

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
};
