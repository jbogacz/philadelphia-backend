import { FastifyPluginAsync } from 'fastify';
import { UserDtoSchema } from './user.types';

export const userRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    '/users/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        description: 'Find user by ID',
        tags: ['users'],
        response: {
          200: UserDtoSchema,
        },
      },
    },
    fastify.controller.user.findById.bind(fastify.controller.user)
  );

  fastify.post(
    '/users',
    {
      schema: {
        description: 'Capture new trace',
        tags: ['users'],
        body: UserDtoSchema,
        response: {
          201: UserDtoSchema,
        },
      },
    },
    fastify.controller.user.register.bind(fastify.controller.user)
  );

  fastify.put(
    '/users',
    {
      schema: {
        description: 'Capture new trace',
        tags: ['users'],
        body: UserDtoSchema,
        response: {
          200: UserDtoSchema,
        },
      },
    },
    fastify.controller.user.update.bind(fastify.controller.user)
  );
};
