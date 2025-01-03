import { FastifyPluginAsync } from 'fastify';
import { AdQuery } from './ad.controller';
import { ImpressionEvent } from './ad.types';

export const adRoutes: FastifyPluginAsync = async fastify => {
  const adController = fastify.controller.ad;
  const impressionController = fastify.controller.impression;

  fastify.get<{
    Querystring: AdQuery;
  }>(
    '/ad',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            publisherId: { type: 'string' },
            targetId: { type: 'string' },
          }
        },
        description: 'Generate ad code script for a given ad unit',
        tags: ['advertisement'],
        response: 200,
      },
    },
    adController.serve.bind(adController),
  );

  fastify.get<{
    Querystring: ImpressionEvent;
  }>(
    '/impression',
    {
      schema: {
        description: 'Send impression event',
        tags: ['advertisement'],
        response: 200,
      },
    },
    impressionController.capture.bind(impressionController),
  );
};
