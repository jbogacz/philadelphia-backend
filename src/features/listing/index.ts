import { FastifyPluginAsync } from 'fastify';
import { listingRoutes } from './listing.routes';

const featurePlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(listingRoutes);
};

export default featurePlugin;
