import { FastifyPluginAsync } from 'fastify';
import { ErrorDtoSchema } from '../../common/errors';
import { VisitTraceDtoSchema, WidgetTraceDtoSchema } from './trace.types';

export const tracePublicRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    '/public/traces/visits',
    {
      schema: {
        body: VisitTraceDtoSchema,
        description: 'Capture page visit trace',
        tags: ['public'],
        response: {
          201: {},
          401: ErrorDtoSchema,
        },
      },
    },
    fastify.controller.trace.captureVisitTrace.bind(fastify.controller.trace)
  );

  fastify.post(
    '/public/traces/widgets',
    {
      schema: {
        body: WidgetTraceDtoSchema,
        description: 'Capture widget link trace',
        tags: ['public'],
        response: {
          201: {},
          401: ErrorDtoSchema,
        },
      },
    },
    fastify.controller.trace.captureWidgetTrace.bind(fastify.controller.trace)
  );
};
