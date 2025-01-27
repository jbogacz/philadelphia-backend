import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

export const traceRoutes: FastifyPluginAsync = async fastify => {
  const TraceRequest = Type.Object({
    traceId: Type.String(),
    email: Type.Optional(Type.String({ format: 'email' })),
    fingerprint: Type.Object({
      fingerprintId: Type.String(),
    }),
    geo: Type.Optional(
      Type.Object({
        language: Type.Optional(Type.String()),
        country: Type.Optional(Type.String()),
        city: Type.Optional(Type.String()),
        timezone: Type.Optional(Type.String()),
      }),
    ),
    device: Type.Optional(
      Type.Object({
        userAgent: Type.String(),
        platform: Type.String(),
        ip: Type.String(),
      }),
    ),
    page: Type.Object({
      domain: Type.Optional(Type.String()),
      path: Type.Optional(Type.String()),
      search: Type.Optional(Type.String()),
      title: Type.Optional(Type.String()),
      referer: Type.Optional(Type.String()),
    }),
  });

  fastify.post(
    '/trace',
    {
      schema: {
        description: 'Capture new trace',
        tags: ['trace'],
        body: TraceRequest,
        response: 201,
      },
    },
    fastify.controller.trace.capture.bind(fastify.controller.trace),
  );

  fastify.get('/hello', (_, res) => res.send({ message: 'Hello, World!' }));

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
};
