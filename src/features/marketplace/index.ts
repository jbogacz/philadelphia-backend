import { FastifyPluginAsync } from 'fastify';
import { demandRoutes } from './demand.routes';

const plugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(demandRoutes);
};

export default plugin;
