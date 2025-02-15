import { FastifyPluginAsync } from 'fastify';
import { authRoutes } from './auth.routes';
import { userRoutes } from './user.routes';

const featurePlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(authRoutes);
  await fastify.register(userRoutes);
};

export default featurePlugin;
