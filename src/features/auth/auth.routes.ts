import { FastifyPluginAsync } from 'fastify';

/**
 /auth
  POST /auth/login         // Login user
  POST /auth/register      // Register new user
  POST /auth/logout        // Logout user
  POST /auth/refresh-token // Refresh JWT token
  POST /auth/forgot-password
  POST /auth/reset-password
 */
export const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    '/auth/login',
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
              user: {
                type: 'object',
                properties: {
                  userId: { type: 'string' },
                  email: { type: 'string' },
                  role: { type: 'string' },
                },
              },
            },
          },
          401: {
            type: 'null',
          },
        },
        tags: ['auth'],
      },
    },
    fastify.controller.user.login.bind(fastify.controller.user)
  );
};
