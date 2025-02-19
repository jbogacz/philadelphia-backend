import { FastifyPluginAsync } from 'fastify';
import { ErrorDtoSchema } from '../../common/errors';
import { WidgetDtoSchema } from './widget.types';

export const widgetRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    '/widgets',
    {
      schema: {
        body: WidgetDtoSchema,
        description: 'Register a new widget',
        tags: ['widgets'],
        response: {
          200: WidgetDtoSchema,
          401: ErrorDtoSchema,
        },
      },
    },
    fastify.controller.widget.register.bind(fastify.controller.widget)
  );
};
