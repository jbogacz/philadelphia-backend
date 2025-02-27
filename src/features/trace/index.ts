import { FastifyPluginAsync } from 'fastify';
import { traceRoutes } from './trace.routes';
import { tracePublicRoutes } from './trace.public.routes';

const featurePlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(traceRoutes);
  await fastify.register(tracePublicRoutes);
};

export default featurePlugin;
