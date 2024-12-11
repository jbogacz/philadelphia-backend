import { TraceRepository } from './trace.repository';
import { CaptureTraceDto } from './trace.types';

export class TraceService {
  constructor(private traceRepository: TraceRepository) {}

  capture(body: CaptureTraceDto) {
    return {
      asd: 'qqq',
    };
  }
}
