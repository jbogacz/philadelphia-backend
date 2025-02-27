import { FastifyPluginAsync } from 'fastify';
import { ErrorDtoSchema } from '../../common/errors';
import { VisitTraceDtoSchema } from './trace.types';

export const tracePublicRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    '/public/traces',
    {
      schema: {
        body: VisitTraceDtoSchema,
        description: 'Capture visit',
        tags: ['public'],
        response: {
          201: {},
          401: ErrorDtoSchema,
        },
      },
    },
    fastify.controller.trace.captureVisit.bind(fastify.controller.trace)
  );
};
