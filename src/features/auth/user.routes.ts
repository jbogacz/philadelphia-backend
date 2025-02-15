import { FastifyPluginAsync } from 'fastify';

export const userRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    '/user/:id',
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
        tags: ['user'],
        response: {
          200: {
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              role: { type: 'string' },
            },
          },
        },
      },
    },
    fastify.controller.user.findById.bind(fastify.controller.user)
  );
};
