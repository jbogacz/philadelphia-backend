import { AppConfig } from '../../app.types';
import { LoggerService } from '../../common';
import { WidgetCodeBuilder } from './widget.code.builder';
import { WidgetCodeBlueprint, WidgetCodeConfig } from './widget.types';

export class WidgetCodeService {
  private logger = LoggerService.getLogger('feature.widget.WidgetCodeService');

  private widgetCodeBuilder: WidgetCodeBuilder = new WidgetCodeBuilder();

  constructor(private readonly config: AppConfig) {}

  async generate(widgetKey: string): Promise<string> {
    this.logger.info('Generating widget code:', { widgetKey });

    const blueprint: WidgetCodeBlueprint = {
      widgetKey,
    };
    const config: WidgetCodeConfig = {
      traceApiUrl: this.config.trace.apiUrl,
    };
    return this.widgetCodeBuilder.build(blueprint, config);
  }
}
