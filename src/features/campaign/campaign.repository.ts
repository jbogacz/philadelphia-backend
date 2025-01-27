import { BaseRepository } from '../base.repository';
import { Collection } from 'mongodb';
import { Campaign } from './campaign.types';

export class CampaignRepository extends BaseRepository<Campaign> {
  constructor(collection: Collection<Campaign>) {
    super(collection);
  }

  async findByCampaignId(campaignId: string, limitTraces?: number): Promise<Campaign | null> {
    const campaign = limitTraces
      ? await this.collection.findOne({ campaignId: campaignId }, { projection: { traces: { $slice: limitTraces } } })
      : await this.collection.findOne({ campaignId: campaignId });

      if (!campaign) {
        throw new Error(`Missing campaign with campaignId: ${campaignId}`);
      }
      return campaign;
  }
}
