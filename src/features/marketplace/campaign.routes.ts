import { FastifyPluginAsync } from 'fastify';
import { ErrorDtoSchema } from '../../common/errors';
import { CampaignQuerySchema, CampaignSchema } from './marketplace.types';

export const campaignRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    '/campaigns',
    {
      schema: {
        querystring: CampaignQuerySchema,
        description: 'Query campaigns',
        tags: ['campaigns'],
        response: {
          200: {
            type: 'array',
            items: CampaignSchema,
          },
          401: ErrorDtoSchema,
        },
      },
    },
    fastify.controller.campaign.query.bind(fastify.controller.campaign)
  );
};
