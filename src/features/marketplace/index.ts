import { FastifyPluginAsync } from 'fastify';
import { demandRoutes } from './demand/demand.routes';
import { offerRoutes } from './offer/offer.routes';
import { campaignRoutes } from './campaign/campaign.routes';

const plugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(demandRoutes);
  await fastify.register(offerRoutes);
  await fastify.register(campaignRoutes);
};

export default plugin;
