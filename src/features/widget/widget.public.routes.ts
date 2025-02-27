import { FastifyPluginAsync } from 'fastify';
import { ErrorDtoSchema } from '../../common/errors';
import { WidgetQueryDto, WidgetQuerySchema } from './widget.types';

export const widgetPublicRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get<{ Querystring: WidgetQueryDto }>(
    '/public/widgets',
    {
      schema: {
        querystring: WidgetQuerySchema,
        description: 'Generate widget code for a given hook',
        tags: ['public'],
        response: {
          200: {
            type: 'string',
            description: 'Successfully generated widget code',
          },
          404: ErrorDtoSchema,
        },
      },
    },
    fastify.controller.widget.generate.bind(fastify.controller.widget)
  );
};
