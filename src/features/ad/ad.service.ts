import { LoggerService } from '../../common';
import { MarkupBuilder } from './markup/ad.markup';
import { AdRequest } from './markup/ad.markup.types';

export class AdService {
  private logger = LoggerService.getLogger('features.ad.AdService');

  private markupBuilder = new MarkupBuilder

  async createAdCode(adRequest: AdRequest): Promise<string> {
    this.logger.info('Creating ad code', adRequest);
    return this.markupBuilder.build(adRequest);
  }
}
