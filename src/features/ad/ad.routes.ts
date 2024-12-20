import { FastifyPluginAsync } from 'fastify';

export const adRoutes: FastifyPluginAsync = async fastify => {

  fastify.get(
    '/ad',
    {
      schema: {
        description: 'Get ad markup',
        tags: ['ad'],
        response: 200
      }
    },
    (_, res) => fastify.controller.ad.getAdMarkup(_, res)
  );
};
