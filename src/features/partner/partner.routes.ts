import { FastifyPluginAsync } from 'fastify';
import { ErrorDtoSchema } from '../../common/errors';
import { PartnerQueryResponseSchema, PartnerQuerySchema } from './partner.types';

interface PartnerParams {
  id: string;
  widgetKey?: string;
  include_visits?: boolean;
}

export const routes: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    '/partners',
    {
      schema: {
        querystring: PartnerQuerySchema,
        description: 'Query partners',
        tags: ['partners'],
        response: {
          200: PartnerQueryResponseSchema,
          400: ErrorDtoSchema,
          500: ErrorDtoSchema,
        },
      },
    },
    fastify.controller.partner.query.bind(fastify.controller.partner)
  );
};
