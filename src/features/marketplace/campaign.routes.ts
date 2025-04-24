import { FastifyPluginAsync } from 'fastify';
import { ErrorDtoSchema } from '../../common/errors';
import { CampaignQuerySchema, CampaignSchema } from './marketplace.types';
import { Type } from '@sinclair/typebox';

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

  fastify.get(
    '/campaigns/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
        tags: ['campaigns'],
        response: {
          200: CampaignSchema,
          401: ErrorDtoSchema,
          404: ErrorDtoSchema,
        },
      },
    },
    fastify.controller.campaign.findById.bind(fastify.controller.campaign)
  );

  fastify.patch(
    '/campaigns/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
        body: Type.Partial(CampaignSchema),
        tags: ['campaigns'],
        response: {
          200: CampaignSchema,
          401: ErrorDtoSchema,
          403: ErrorDtoSchema,
          404: ErrorDtoSchema,
        },
      },
    },
    fastify.controller.campaign.update.bind(fastify.controller.campaign)
  );
};
