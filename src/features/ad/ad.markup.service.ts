import { AppConfig } from '../../app.types';
import { LoggerService } from '../../common';
import { AdMarkupConfig, AdMarkupBlueprint, AdCreative } from './ad.types';
import { CreativeService } from './creative.service';
import { AdMarkupBuilder } from './markup/ad.markup.builder';

export class AdMarkupService {
  private logger = LoggerService.getLogger('features.ad.AdService');

  constructor(
    private readonly creativeService: CreativeService,
    private readonly config: AppConfig,
    private readonly markupBuilder = new AdMarkupBuilder(),
  ) {}

  async generate(publisherId: string, targetId: string): Promise<string> {
    this.logger.info('Creating ad markup', { publisherId, targetId });

    const creative: AdCreative = await this.creativeService.findCreative(publisherId);

    const markupBlueprint: AdMarkupBlueprint = {
      publisherId,
      targetId,
      advertiserId: creative.advertiserId,
      campaignId: creative.campaignId,
      creativeId: creative.creativeId,
      creativeUrl: creative.creativeUrl,
    };

    const markupConfig: AdMarkupConfig = {
      traceApiUrl: this.config.trace.apiUrl,
      impressionApiUrl: this.config.impression.apiUrl,
    };

    return this.markupBuilder.build(markupBlueprint, markupConfig);
  }
}
