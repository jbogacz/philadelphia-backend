import { AdCreative } from './ad.types';

export class CreativeService {
  async findCreative(publisherId: string): Promise<AdCreative> {
    const creative = {
      creativeId: 'creative-1',
      creativeUrl: "fileUrl",
      campaignId: 'campaign-1',
      advertiserId: 'advertiser-1',
    };
    return creative;
  }
}
