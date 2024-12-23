import { LoggerService } from '../../common';
import { createAdMarkup } from './markup/ad.markup';
import { AdRequest } from './markup/ad.markup.types';

export class AdService {
  private logger = LoggerService.getLogger('AdService');

  async createAdCode(adRequest: AdRequest): Promise<string> {
    this.logger.info('Creating ad code', adRequest);
    return createAdMarkup(adRequest);
  }
}
