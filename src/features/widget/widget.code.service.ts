import { AppConfig } from '../../app.types';
import { LoggerService } from '../../common';
import { PartnershipRepository } from '../partnership/partnership.repository';
import { Partnership } from '../partnership/partnership.types';
import { WidgetCodeBuilder } from './widget.code.builder';
import { WidgetRepository } from './widget.repository';
import { WidgetCodeBlueprint, WidgetCodeConfig, WidgetPanelLink, WidgetStatus } from './widget.types';

export class WidgetCodeService {
  private logger = LoggerService.getLogger('feature.widget.WidgetCodeService');

  private widgetCodeBuilder: WidgetCodeBuilder = new WidgetCodeBuilder();

  constructor(
    private readonly widgetRepository: WidgetRepository,
    private readonly partnershipRepository: PartnershipRepository,
    private readonly config: AppConfig
  ) {}

  async generate(widgetKey: string): Promise<string | null> {
    this.logger.info('Generating widget code:', { widgetKey });

    const widget = await this.widgetRepository.findByWidgetKey(widgetKey);
    if (!widget) {
      this.logger.error('Widget not found:', widgetKey);
      return null;
    }

    if (widget.status === WidgetStatus.INACTIVE || widget.status === WidgetStatus.DELETED) {
      this.logger.warn('Widget is inactive or deleted:', widget);
      return null;
    }

    const links = (await this.partnershipRepository.findAllBySourceWidgetKey(widgetKey)).map(
      (p: Partnership) =>
        ({
          name: p.pageName,
          url: p.pageUrl,
          description: p.pageDescription,
          widgetKey: p.widgetKey,
          sourceWidgetKey: p.sourceWidgetKey,
        } as WidgetPanelLink)
    );

    if (links.length === 0) {
      this.logger.warn('WidgetPanel will be skipped. No partnerships found for widget:', { widget });
    }

    const blueprint: WidgetCodeBlueprint = {
      widgetKey,
      links: links,
    };
    const config: WidgetCodeConfig = {
      apiUrl: this.config.apiUrl,
    };
    return this.widgetCodeBuilder.build(blueprint, config);
  }
}
