import { FastifyPluginAsync } from 'fastify';
import { ErrorDtoSchema } from '../../common/errors';
import { WidgetDtoSchema } from './widget.types';

export const widgetRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    '/widgets',
    {
      schema: {
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

  fastify.put(
    '/widgets/:id',
    {
      schema: {
        body: WidgetDtoSchema,
        description: 'Update widget',
        tags: ['widgets'],
        response: {
          200: WidgetDtoSchema,
          404: ErrorDtoSchema,
        },
      },
    },
    fastify.controller.widget.update.bind(fastify.controller.widget)
  );

  fastify.get<{
    Params: { id: string };
  }>(
    '/widgets/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        description: 'Find widget by id',
        tags: ['widgets'],
        response: {
          200: WidgetDtoSchema,
          404: ErrorDtoSchema,
        },
      },
    },
    fastify.controller.widget.findById.bind(fastify.controller.widget)
  );
};
