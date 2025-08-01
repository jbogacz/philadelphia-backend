import { FastifyPluginAsync } from 'fastify';
import { HookDtoSchema, HookQuerySchema, HookUpdateDtoSchema } from './hook.types';
import { ErrorDtoSchema } from '../../common/errors';

export const routes: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    '/hooks',
    {
      schema: {
        querystring: HookQuerySchema,
        description: 'Query hooks',
        tags: ['hooks'],
        response: {
          200: {
            type: 'array',
            items: HookDtoSchema,
          },
        },
      },
    },
    fastify.controller.hook.query.bind(fastify.controller.hook)
  );

  fastify.get(
    '/hooks/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        description: 'Find hook by ID',
        tags: ['hooks'],
        response: {
          200: HookDtoSchema,
          401: ErrorDtoSchema,
          404: ErrorDtoSchema,
        },
      },
    },
    fastify.controller.hook.findById.bind(fastify.controller.hook)
  );

  fastify.post(
    '/hooks',
    {
      schema: {
        body: HookDtoSchema,
        description: 'Create hook',
        tags: ['hooks'],
        response: {
          201: HookDtoSchema,
          401: ErrorDtoSchema,
        },
      },
    },
    fastify.controller.hook.create.bind(fastify.controller.hook)
  );

  fastify.put(
    '/hooks/:id',
    {
      schema: {
        body: HookUpdateDtoSchema,
        description: 'Update hook',
        tags: ['hooks'],
        response: {
          200: HookDtoSchema,
          401: ErrorDtoSchema,
          404: ErrorDtoSchema,
        },
      },
    },
    fastify.controller.hook.update.bind(fastify.controller.hook)
  );

  fastify.delete(
    '/hooks/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        description: 'Delete hook',
        tags: ['hooks'],
        response: {
          204: {
            type: 'null',
          },
          401: ErrorDtoSchema,
          404: ErrorDtoSchema,
        },
      },
    },
    fastify.controller.hook.delete.bind(fastify.controller.hook)
  );
};
