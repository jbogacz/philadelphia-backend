import { FastifyPluginAsync } from 'fastify';
import { userRoutes } from './user.routes';

const featurePlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(userRoutes);
};

export default featurePlugin;
