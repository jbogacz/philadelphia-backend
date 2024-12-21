import { createAdMarkup } from './markup/ad.markup.js';
import { AdConfig, AdRequest } from './markup/ad.markup.types.js';

export class AdService {
  async createAdCode(adRequest: AdRequest): Promise<string> {
    try {
      const adCode = await createAdMarkup(adRequest);

      return adCode;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
