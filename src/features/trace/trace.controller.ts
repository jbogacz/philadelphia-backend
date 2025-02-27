import { FastifyReply, FastifyRequest } from 'fastify';
import { TraceService } from './trace.service';
import { VisitTraceDto } from './trace.types';

export class TraceController {
  constructor(private readonly traceService: TraceService) {}

  async captureVisit(
    request: FastifyRequest<{ Body: VisitTraceDto }>,
    reply: FastifyReply,
  ): Promise<void> {
    await this.traceService.captureVisit(request.body);
    reply.code(201).send();
  }
}
