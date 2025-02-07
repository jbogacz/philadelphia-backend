import { FastifyPluginAsync } from 'fastify';

export const traceRoutes: FastifyPluginAsync = async fastify => {
  fastify.post(
    '/login',
    {
      schema: {
        body: {
          type: 'object',
          required: ['login', 'password'],
          properties: {
            login: { type: 'string', default: 'admin@example.com' },
            password: { type: 'string', default: 'password' },
          },
        },
        response: {
          200: {
            type: 'object',
            required: ['token'],
            properties: {
              token: { type: 'string', default: 'token' },
            },
          },
          401: {},
        },
        tags: ['user'],
      },
    },
    fastify.controller.user.login.bind(fastify.controller.user),
  );
};
