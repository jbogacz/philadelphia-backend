import { FastifyPluginAsync } from 'fastify';
import { ErrorDtoSchema } from '../../common/errors';
import { CampaignDateProposalSchema, CampaignQuerySchema, CampaignSchema } from './marketplace.types';
import { Type } from '@sinclair/typebox';
import { DateTimeType } from '../base.repository';

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

  fastify.post(
    '/campaigns/:id/propose-date',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
        body: Type.Object({
          startDate: DateTimeType,
        }),
        tags: ['campaigns'],
        response: {
          200: CampaignDateProposalSchema,
          400: ErrorDtoSchema,
          401: ErrorDtoSchema,
          403: ErrorDtoSchema,
          404: ErrorDtoSchema,
        },
      },
    },
    fastify.controller.campaign.proposeStartDate.bind(fastify.controller.campaign)
  );

  fastify.put(
    '/campaigns/:id/respond-to-date',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
        body: Type.Object({
          status: Type.Union([Type.Literal('accept'), Type.Literal('reject')]),
        }),
        tags: ['campaigns'],
        response: {
          200: CampaignDateProposalSchema,
          400: ErrorDtoSchema,
          401: ErrorDtoSchema,
          403: ErrorDtoSchema,
          404: ErrorDtoSchema,
        },
      },
    },
    fastify.controller.campaign.respondToDateProposal.bind(fastify.controller.campaign)
  );
};
