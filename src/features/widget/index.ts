import { FastifyPluginAsync } from 'fastify';
import { widgetRoutes } from './widget.routes';

const featurePlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(widgetRoutes);
};

export default featurePlugin;
