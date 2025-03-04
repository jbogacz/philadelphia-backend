import { AppConfig } from '../../app.types';
import { LoggerService } from '../../common';
import { PartnershipRepository } from '../partnership/partnership.repository';
import { Partnership } from '../partnership/partnership.types';
import { WidgetCodeBuilder } from './widget.code.builder';
import { WidgetCodeBlueprint, WidgetCodeConfig, WidgetPanelLink } from './widget.types';

export class WidgetCodeService {
  private logger = LoggerService.getLogger('feature.widget.WidgetCodeService');

  private widgetCodeBuilder: WidgetCodeBuilder = new WidgetCodeBuilder();

  constructor(private readonly partnershipRepository: PartnershipRepository, private readonly config: AppConfig) {}

  async generate(widgetKey: string): Promise<string> {
    this.logger.info('Generating widget code:', { widgetKey });

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
