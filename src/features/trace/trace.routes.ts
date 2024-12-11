import { FastifyPluginAsync } from 'fastify';
import { TraceRepository } from './trace.repository';
import { TraceService } from './trace.service';
import { TraceController } from './trace.controller';

export const traceRoutes: FastifyPluginAsync = async (fastify) => {
  const repository = new TraceRepository();
  const service = new TraceService(repository);
  const controller = new TraceController(service);

  // TODO: How does 'bind' work?
  
  fastify.post('/trace', controller.createTrace.bind(controller));
};
