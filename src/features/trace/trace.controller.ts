import { FastifyReply, FastifyRequest } from 'fastify';
import { TraceService } from './trace.service';
import { CaptureTraceDto } from './trace.types';

export class TraceController {
  constructor(private readonly traceService: TraceService) {}

  async createTrace(
    request: FastifyRequest<{ Body: CaptureTraceDto }>,
    reply: FastifyReply
  ): Promise<void> {
    const trace = await this.traceService.capture(request.body);
    reply.code(201).send(trace);
  }
}
