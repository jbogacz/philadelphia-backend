import { FastifyPluginAsync } from 'fastify';
import { hookRoutes } from './hook.routes';

const featurePlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(hookRoutes);
};

export default featurePlugin;
