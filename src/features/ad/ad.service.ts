import { LoggerService } from '../../common';
import { AdRequest } from './ad.types';
import { MarkupBuilder } from './markup/ad.markup';

export class AdService {
  private logger = LoggerService.getLogger('features.ad.AdService');

  private markupBuilder = new MarkupBuilder();

  async createAdCode(publisherId: string, targetId: string): Promise<string> {
    this.logger.info('Creating ad code', { publisherId, targetId });

    // TODO: Call endpoint to get ad configuration
    const adRequest: AdRequest = {
      publisherId,
      targetId,
      advertiserId: 'advertiser-1',
      creativeId: 'creative-1',
      campaignId: 'campaign-1',
    };

    return this.markupBuilder.build(adRequest);
  }
}
