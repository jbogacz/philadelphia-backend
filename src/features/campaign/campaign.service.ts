import { CampaignRepository } from './campaign.repository';
import { Campaign, CampaignTrace } from './campaign.types';

export class CampaignService {
  constructor(private readonly campaignRepository: CampaignRepository) {}

  async findById(campaignId: string): Promise<Campaign> {
    return this.campaignRepository.findByCampaignId(campaignId);
  }

  async appendTrace(campaignId: string, trace: CampaignTrace): Promise<void> {
    return this.campaignRepository.appendTrace(campaignId, trace);
  }
}
