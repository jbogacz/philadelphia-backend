import { FastifyPluginAsync } from 'fastify';
import { insightRoutes } from './insight.routes';

const featurePlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(insightRoutes);
};

export default featurePlugin;
