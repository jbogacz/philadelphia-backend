// Error handler plugin
import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { NotFoundError, UnauthorizedError } from '../common/errors';

const errorHandler: FastifyPluginAsync = async (fastify) => {
  fastify.setErrorHandler((error, request, reply) => {
    fastify.log.error(error);

    if (error instanceof NotFoundError) {
      return reply.status(404).send({
        code: 404,
        error: error.name,
        message: error.message,
      });
    }

    if (error instanceof UnauthorizedError) {
      return reply.status(401).send({
        code: 401,
        error: error.name,
        message: error.message,
      });
    }

    // Handle validation errors from Fastify
    if (error instanceof Error) {
      return reply.status(400).send({
        code: 400,
        error: error.name,
        message: error.message,
      });
    }
  });
};

export default fp(errorHandler);
