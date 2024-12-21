import { FastifyPluginAsync } from 'fastify';
import { AdRequestParams } from './ad.controller';

export const adRoutes: FastifyPluginAsync = async fastify => {
  const adController = fastify.controller.ad;

  fastify.get<{
    Querystring: AdRequestParams;
  }>(
    '/ad',
    {
      schema: {
        description: 'Get ad markup',
        tags: ['ad'],
        response: 200
      }
    },
    adController.serve.bind(adController)
  );
};
