import { FastifyPluginAsync } from 'fastify';
import { TraceService } from './trace.service';
import { TraceController } from './trace.controller';
import { CaptureTraceSchema } from './trace.types';

export const traceRoutes: FastifyPluginAsync = async (fastify) => {
  const service = new TraceService(fastify.repository.profile);
  const controller = new TraceController(service);

  // TODO: How does 'bind' work?

  fastify.post(
    '/trace',
    {
      schema: {
        body: CaptureTraceSchema,
        response: {
          201: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              ...CaptureTraceSchema.properties,
            },
          },
        },
        description: 'Create a new user',
        tags: ['user'],
      },
    },
    controller.capture.bind(controller)
  );
};
