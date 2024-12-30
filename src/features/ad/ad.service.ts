import { LoggerService } from '../../common';
import { AdMarkupRequest } from './ad.types';
import { AdMarkupBuilder } from './markup/ad.markup.builder';

export class AdService {
  private logger = LoggerService.getLogger('features.ad.AdService');

  private adMarkupBuilder = new AdMarkupBuilder();

  async buildMarkupContent(publisherId: string, targetId: string): Promise<string> {
    this.logger.info('Creating ad markup', { publisherId, targetId });

    // TODO: Call endpoint to get ad details
    const adMarkupRequest: AdMarkupRequest = {
      publisherId,
      targetId,
      advertiserId: 'advertiser-1',
      creativeId: 'creative-1',
      campaignId: 'campaign-1',
    };

    return this.adMarkupBuilder.build(adMarkupRequest);
  }
}
