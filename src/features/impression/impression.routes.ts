import { FastifyPluginAsync } from 'fastify';
import { ImpressionEvent } from './impression.types';

export const adRoutes: FastifyPluginAsync = async fastify => {
  const impressionController = fastify.controller.impression;

  fastify.get<{
    Querystring: ImpressionEvent;
  }>(
    '/track/impression',
    {
      schema: {},
    },
    impressionController.capture.bind(impressionController),
  );
};
