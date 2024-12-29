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
      domain: Type.String(),
      path: Type.String(),
      search: Type.String(),
      title: Type.String(),
      referer: Type.String(),
    }),
  });

  fastify.post(
    '/traces',
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
};
