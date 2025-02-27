import { FastifyPluginAsync } from 'fastify';
import { widgetRoutes } from './widget.routes';
import { widgetPublicRoutes } from './widget.public.routes';

const featurePlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(widgetRoutes);
  await fastify.register(widgetPublicRoutes);
};

export default featurePlugin;
