import { FastifyPluginAsync } from 'fastify';
import { OfferDtoSchema, OfferQuerySchema, OfferSchema, UpdateOfferDtoSchema } from './marketplace.types';
import { ErrorDtoSchema } from '../../common/errors';
import { Type } from '@sinclair/typebox';

export const offerRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    '/offers',
    {
      schema: {
        body: OfferDtoSchema,
        tags: ['offers'],
        response: {
          201: OfferSchema,
          401: ErrorDtoSchema,
        },
      },
    },
    fastify.controller.offer.create.bind(fastify.controller.offer)
  );

  fastify.put(
    '/offers/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
        body: UpdateOfferDtoSchema,
        tags: ['offers'],
        response: {
          200: OfferSchema,
          401: ErrorDtoSchema,
          403: ErrorDtoSchema,
          404: ErrorDtoSchema,
        },
      },
    },
    fastify.controller.offer.update.bind(fastify.controller.offer)
  );

  fastify.patch(
    '/offers/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
        body: Type.Partial(OfferSchema),
        tags: ['offers'],
        response: {
          200: OfferSchema,
          401: ErrorDtoSchema,
          403: ErrorDtoSchema,
          404: ErrorDtoSchema,
        },
      },
    },
    fastify.controller.offer.update.bind(fastify.controller.offer)
  );

  fastify.get(
    '/offers',
    {
      schema: {
        querystring: OfferQuerySchema,
        description: 'Query offers',
        tags: ['offers'],
        response: {
          200: {
            type: 'array',
            items: OfferSchema,
          },
          401: ErrorDtoSchema,
        },
      },
    },
    fastify.controller.offer.query.bind(fastify.controller.offer)
  );

  fastify.get(
    '/offers/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
        tags: ['offers'],
        response: {
          200: OfferSchema,
          404: ErrorDtoSchema,
          401: ErrorDtoSchema,
        },
      },
    },
    fastify.controller.offer.findById.bind(fastify.controller.offer)
  );

  fastify.delete(
    '/offers/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
        tags: ['offers'],
        response: {
          204: {},
          404: ErrorDtoSchema,
          401: ErrorDtoSchema,
        },
      },
    },
    fastify.controller.offer.delete.bind(fastify.controller.offer)
  );
};
