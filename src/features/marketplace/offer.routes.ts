import { FastifyPluginAsync } from 'fastify';
import { OfferDtoSchema, OfferQuerySchema, UpdateOfferDtoSchema } from './marketplace.types';
import { ErrorDtoSchema } from '../../common/errors';

export const offerRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    '/offers',
    {
      schema: {
        body: OfferDtoSchema,
        tags: ['offers'],
        response: {
          201: OfferDtoSchema,
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
          200: OfferDtoSchema,
          404: ErrorDtoSchema,
          401: ErrorDtoSchema,
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
            items: OfferDtoSchema,
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
          200: OfferDtoSchema,
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
