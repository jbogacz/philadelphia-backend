import { FastifyReply, FastifyRequest } from 'fastify';
import { TraceService } from './trace.service';
import { CaptureTraceDto } from './trace.types';

export class TraceController {
  constructor(private readonly traceService: TraceService) {}

  async capture(
    request: FastifyRequest<{ Body: CaptureTraceDto }>,
    reply: FastifyReply,
  ): Promise<void> {
    await this.traceService.capture(request.body);
    reply.code(201).send();
  }
}
