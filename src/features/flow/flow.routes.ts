import { FastifyPluginAsync } from 'fastify';
import { randomId } from '../../common/utils';

export const flowRoutes: FastifyPluginAsync = async fastify => {
  fastify.get(
    '/flow',
    {
      schema: {
        querystring: {
          type: 'object',
          required: ['utm_campaign', 'utm_source', 'utm_content'],
          properties: {
            utm_campaign: { type: 'string', default: 'campaign-1' },
            utm_source: { type: 'string', default: 'instagram' },
            utm_content: { type: 'string', default: 'content-1' },
          },
        },
        tags: ['flow'],
      },
    },
    fastify.controller.flow.serveCode.bind(fastify.controller.flow),
  );

  fastify.post(
    '/flow',
    {
      schema: {
        body: {
          type: 'object',
          required: ['traceId', 'fingerprint', 'publishedId', 'campaignId', 'source'],
          properties: {
            traceId: { type: 'string', default: 'trace-' + randomId() },
            fingerprint: {
              type: 'object',
              required: ['fingerprintId'],
              properties: { fingerprintId: { type: 'string', default: 'fingerprint-' + randomId() } },
            },
            publishedId: { type: 'string', default: 'publisher-1' },
            campaignId: { type: 'string', default: 'campaign-1' },
            source: { type: 'string', default: 'instagram' },
          },
        },
        response: 204,
        tags: ['flow'],
      },
    },
    fastify.controller.flow.capture.bind(fastify.controller.flow),
  );
};
