import { LoggerService } from '../../common';
import { WidgetRepository } from '../widget/widget.repository';
import { TraceRepository } from './trace.repository';
import { VisitTraceDto } from './trace.types';

export class TraceService {
  private logger = LoggerService.getLogger('trace:service');

  constructor(private readonly traceRepository: TraceRepository, private readonly widgetRepository: WidgetRepository) {}

  async captureVisit(traceDto: VisitTraceDto): Promise<void> {
    this.logger.info('Capture visit:', traceDto);

    const widget = await this.widgetRepository.findByWidgetKey(traceDto.widgetKey);
    if (!widget) {
      this.logger.error('Widget not found:', traceDto.widgetKey);
    }

    const trace = {
      ...traceDto,
      type: 'visit',
      widgetId: widget?._id || '',
      hookId: widget?.hookId || '',
    };
    await this.traceRepository.create(trace);
  }
}
