import { LoggerService } from '../../common';
import { HookRepository } from '../hook/hook.repository';
import { Hook, HookStatus } from '../hook/hook.types';
import { WidgetRepository } from '../widget/widget.repository';
import { Widget, WidgetStatus } from '../widget/widget.types';
import { TraceRepository } from './trace.repository';
import { TraceType, VisitTraceDto, WidgetTraceDto } from './trace.types';

export class TraceService {
  private logger = LoggerService.getLogger('trace:service');

  constructor(
    private readonly traceRepository: TraceRepository,
    private readonly widgetRepository: WidgetRepository,
    private readonly hookRepository: HookRepository
  ) {}

  async captureVisitTrace(traceDto: VisitTraceDto): Promise<void> {
    const visitTrace = { ...traceDto, type: TraceType.VISIT };

    this.logger.info('Processing trace', { ...visitTrace, fingerprint: { ...visitTrace.fingerprint, components: '!Large data omitted!' } });

    const widget = await this.widgetRepository.findByWidgetKey(visitTrace.widgetKey);
    if (!widget) {
      this.logger.warn('Received trace with invalid widgetKey:', visitTrace);
      return;
    }

    if (widget.status == WidgetStatus.INACTIVE) {
      this.logger.warn('Received trace for inactive widget:', { trace: visitTrace, widget: widget });
      return;
    }

    if (widget.status == WidgetStatus.DELETED) {
      this.logger.warn('Received trace for deleted widget:', { trace: visitTrace, widget: widget });
      return;
    }

    if (widget.status == WidgetStatus.REGISTERED) {
      await this.widgetRepository.update(widget._id!, { status: WidgetStatus.ACTIVE } as Widget);
      widget.status = WidgetStatus.ACTIVE;

      await this.hookRepository.update(widget.hookId!, {
        status: HookStatus.ACTIVE,
        domain: visitTrace.page.domain,
      } as Hook);
      this.logger.info('Activated hook and widget:', { trace: visitTrace, widget: widget });
    }

    if (widget.status == WidgetStatus.ACTIVE) {
      const trace = {
        ...visitTrace,
        widgetId: widget?._id || '',
        hookId: widget?.hookId || '',
      };
      await this.traceRepository.create(trace);
      this.logger.info('Captured visit trace:', { ...trace, fingerprint: { ...trace.fingerprint, components: '!Large data omitted!' } });
    }
  }

  async captureWidgetTrace(traceDto: WidgetTraceDto): Promise<void> {
    const widgetTrace = { ...traceDto, type: TraceType.WIDGET };

    this.logger.info('Processing trace', { ...widgetTrace, fingerprint: { ...widgetTrace.fingerprint, components: '!Large data omitted!' } });

    const widget = await this.widgetRepository.findByWidgetKey(widgetTrace.widgetKey);
    if (!widget) {
      this.logger.warn('Received trace with invalid widgetKey:', widgetTrace);
      return;
    }

    const sourceWidget = await this.widgetRepository.findByWidgetKey(widgetTrace.sourceWidgetKey);
    if (!sourceWidget) {
      this.logger.warn('Received trace with invalid sourceWidgetKey:', widgetTrace);
      return;
    }

    if (sourceWidget.status === WidgetStatus.ACTIVE && widget.status == WidgetStatus.ACTIVE) {
      const trace = {
        ...widgetTrace,
        widgetId: widget?._id || '',
        hookId: widget?.hookId || '',
        sourceWidgetId: sourceWidget?._id || '',
        sourceHookId: sourceWidget?.hookId || '',
      };
      await this.traceRepository.create(trace);
      this.logger.info('Captured widget trace:', { ...trace, fingerprint: { ...trace.fingerprint, components: '!Large data omitted!' } });
    }
  }
}
