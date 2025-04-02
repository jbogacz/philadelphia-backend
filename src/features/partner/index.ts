import { FastifyPluginAsync } from 'fastify';
import { routes } from './partner.public.routes';

const plugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(routes);
};

export default plugin;
