// Error handler plugin
import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

const errorHandler: FastifyPluginAsync = async fastify => {
  fastify.setErrorHandler((error, request, reply) => {
    fastify.log.error(error);

    // Handle validation errors from Fastify
    if (error instanceof Error) {
      return reply.status(400).send({
        statusCode: 400,
        error: error.name,
        message: error.message,
      });
    }
  });
};

export default fp(errorHandler);
