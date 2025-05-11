import { FastifyPluginAsync } from 'fastify';

export const flowRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    '/flows',
    {
      schema: {
        querystring: {
          type: 'object',
          required: ['utm_campaign', 'utm_source', 'utm_content'],
          properties: {
            utm_campaign: { type: 'string', default: 'campaign-1' },
            utm_source: { type: 'string', default: 'instagram' },
            utm_content: { type: 'string', default: 'publisher-1' },
          },
        },
        tags: ['flow'],
      },
    },
    fastify.controller.flow.serveCode.bind(fastify.controller.flow)
  );
};
