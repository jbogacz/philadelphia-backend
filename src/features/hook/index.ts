import { FastifyPluginAsync } from 'fastify';
import { routes } from './hook.routes';

const plugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(routes);
};

export default plugin;
