import { FastifyPluginAsync } from 'fastify';
import { TraceService } from './trace.service';
import { TraceController } from './profile.controller';
import { Type } from '@sinclair/typebox';

export const traceRoutes: FastifyPluginAsync = async (fastify) => {
  const service = new TraceService(fastify.repository.profile);
  const controller = new TraceController(service);

  // TODO: How does 'bind' work?

  const TraceRequest = Type.Object({
    fingerprintId: Type.String(),
    email: Type.Optional(Type.String({ format: 'email' })),
    domain: Type.String(),
    page: Type.String(),
    title: Type.String(),
    referer: Type.String(),
  });

  const ProfileResponse = Type.Object({
    fingerprints: Type.Array(
      Type.Object({
        fingerprintId: Type.String(),
        created: Type.String({ format: 'date-time' }),
        lastSeen: Type.String({ format: 'date-time' }),
      })
    ),
    emails: Type.Array(
      Type.Object({
        value: Type.String(),
        created: Type.String({ format: 'date-time' }),
        lastSeen: Type.String({ format: 'date-time' }),
      })
    ),
    visits: Type.Array(
      Type.Object({
        created: Type.String({ format: 'date-time' }),
        domain: Type.String(),
        page: Type.String(),
        title: Type.String(),
        referer: Type.String(),
      })
    ),
  });

  fastify.post(
    '/traces',
    {
      schema: {
        description: 'Capture new trace',
        tags: ['trace'],
        body: TraceRequest,
        response: {
          201: ProfileResponse,
        },
      },
    },
    controller.capture.bind(controller)
  );
};
