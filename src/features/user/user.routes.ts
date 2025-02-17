import { FastifyPluginAsync } from 'fastify';

export const userRoutes: FastifyPluginAsync = async (fastify) => {
  const userDtoSchema = {
    type: 'object',
    required: ['id', 'email'],
    properties: {
      id: { type: 'string' },
      email: { type: 'string' },
      role: { type: 'string' },
    },
  };

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
          200: userDtoSchema,
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
        body: userDtoSchema,
        response: {
          201: userDtoSchema,
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
        body: userDtoSchema,
        response: {
          200: userDtoSchema,
        },
      },
    },
    fastify.controller.user.update.bind(fastify.controller.user)
  );
};
