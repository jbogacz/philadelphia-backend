import { FastifyPluginAsync } from 'fastify';
import { demandRoutes } from './demand.routes';
import { offerRoutes } from './offer.routes';

const plugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(demandRoutes);
  await fastify.register(offerRoutes);
};

export default plugin;
