import { FastifyPluginAsync } from 'fastify';
import { ListingQueryDto } from './listing.types';

export const listingRoutes: FastifyPluginAsync = async (fastify) => {
  const listingController = fastify.controller.listing;

  const dtoSchema = {
    type: 'object',
    properties: {
      id: { type: 'string' },
      type: { type: 'string' },
      title: { type: 'string' },
      author: { type: 'string' },
      marketType: { type: 'string' },
      date: { type: 'string' },
      description: { type: 'string' },
      audience: { type: 'string' },
      engagement: { type: 'string' },
      targetAudience: { type: 'string' },
      budget: { type: 'string' },
    },
  };

  fastify.get<{
    Querystring: ListingQueryDto;
  }>(
    '/listings',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            type: { type: 'string' },
          },
        },
        description: 'Query listings',
        tags: ['listing'],
        response: {
          200: {
            type: 'array',
            items: dtoSchema,
          },
        },
      },
    },
    listingController.query.bind(listingController)
  );

  fastify.get<{
    Params: { id: string };
  }>(
    '/listings/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        description: 'Query listings',
        tags: ['listing'],
        response: {
          200: dtoSchema,
        },
      },
    },
    listingController.findById.bind(listingController)
  );
};
