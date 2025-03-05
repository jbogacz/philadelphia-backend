import { FastifyReply, FastifyRequest } from 'fastify';
import { TraceService } from './trace.service';
import { VisitTraceDto, WidgetTraceDto } from './trace.types';

export class TraceController {
  constructor(private readonly traceService: TraceService) {}

  async captureVisitTrace(request: FastifyRequest<{ Body: VisitTraceDto }>, reply: FastifyReply): Promise<void> {
    await this.traceService.captureVisitTrace(request.body);
    reply.code(201).send();
  }

  async captureWidgetTrace(request: FastifyRequest<{ Body: WidgetTraceDto }>, reply: FastifyReply): Promise<void> {
    await this.traceService.captureWidgetTrace(request.body);
    reply.code(201).send();
  }
}
