import { AppConfig } from '../../app.types';
import { LoggerService } from '../../common';
import { AdMarkupConfig, AdMarkupRequest } from './ad.types';
import { AdMarkupBuilder } from './markup/ad.markup.builder';

export class AdService {
  private logger = LoggerService.getLogger('features.ad.AdService');

  constructor(
    private readonly config: AppConfig,
    private readonly adMarkupBuilder = new AdMarkupBuilder(),
  ) {}

  async createMarkupCode(publisherId: string, targetId: string): Promise<string> {
    this.logger.info('Creating ad markup', { publisherId, targetId });

    const markupConfig: AdMarkupConfig = {
      traceApiUrl: this.config.trace.apiUrl,
      impressionApiUrl: this.config.impression.apiUrl,
    };

    // TODO: Call endpoint to get ad details
    const markupRequest: AdMarkupRequest = {
      publisherId,
      targetId,
      advertiserId: 'advertiser-1',
      creativeId: 'creative-1',
      campaignId: 'campaign-1',
    };

    return this.adMarkupBuilder.build(markupConfig, markupRequest);
  }
}
