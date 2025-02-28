import { FastifyPluginAsync } from 'fastify';

export const traceRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/hello', (request, res) => {
    return res.send({ message: 'Hello, World!' });
  });
};
