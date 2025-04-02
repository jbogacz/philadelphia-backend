import { FastifyInstance } from 'fastify';

// Simple module-level variable to store the Fastify instance
let fastifyInstance: FastifyInstance | null = null;

/**
 * Set the Fastify instance
 */
export function setFastifyInstance(instance: FastifyInstance): void {
  fastifyInstance = instance;
}

/**
 * Get the Fastify instance
 */
export function getFastifyInstance(): FastifyInstance {
  if (!fastifyInstance) {
    throw new Error('Fastify instance not set. Make sure to call setFastifyInstance before using decorators.');
  }
  return fastifyInstance;
}
