import { LoggerService } from '../../common/logger.service.js';
import { createAdMarkup } from './markup/ad.markup.js';
import { AdRequest } from './markup/ad.markup.types.js';

export class AdService {
  private logger = LoggerService.getLogger('AdService');

  async createAdCode(adRequest: AdRequest): Promise<string> {
    return createAdMarkup(adRequest);
  }
}
