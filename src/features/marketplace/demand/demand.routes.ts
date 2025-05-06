import { FastifyPluginAsync } from 'fastify';
import { ErrorDtoSchema } from '../../../common/errors';
import { DemandDtoSchema, DemandQuerySchema, UpdateDemandDtoSchema } from '../marketplace.types';

export const demandRoutes: FastifyPluginAsync = async (fastify) => {
  // const fastify = instance.getTyped();

  fastify.post(
    '/demands',
    {
      schema: {
        body: DemandDtoSchema,
        tags: ['demands'],
        response: {
          201: DemandDtoSchema,
          401: ErrorDtoSchema,
        },
      },
    },
    fastify.controller.demand.create.bind(fastify.controller.demand)
  );

  fastify.put(
    '/demands/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
        body: UpdateDemandDtoSchema,
        tags: ['demands'],
        response: {
          200: DemandDtoSchema,
          404: ErrorDtoSchema,
          401: ErrorDtoSchema,
        },
      },
    },
    fastify.controller.demand.update.bind(fastify.controller.demand)
  );

  fastify.get(
    '/demands',
    {
      schema: {
        querystring: DemandQuerySchema,
        description: 'Query demands',
        tags: ['demands'],
        response: {
          200: {
            type: 'array',
            items: DemandDtoSchema,
          },
          401: ErrorDtoSchema,
        },
      },
    },
    fastify.controller.demand.query.bind(fastify.controller.demand)
  );

  fastify.get(
    '/demands/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
        tags: ['demands'],
        response: {
          200: DemandDtoSchema,
          404: ErrorDtoSchema,
          401: ErrorDtoSchema,
        },
      },
    },
    fastify.controller.demand.findById.bind(fastify.controller.demand)
  );

  fastify.delete(
    '/demands/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
        tags: ['demands'],
        response: {
          204: {},
          404: ErrorDtoSchema,
          401: ErrorDtoSchema,
        },
      },
    },
    fastify.controller.demand.delete.bind(fastify.controller.demand)
  );
};
