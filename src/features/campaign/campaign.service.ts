import { Campaign, CampaignStatus } from './campaign.types';

export class CampaignService {
  async findById(campaignId: string): Promise<Campaign> {
    return {
      campaignId: campaignId,
      advertiserId: 'advertiser-1',
      landingPage: 'https://quip.com/',
      status: CampaignStatus.ACTIVE,
      traces: [],
    };
  }
}
