import { BaseRepository } from '../base.repository';
import { Collection } from 'mongodb';
import { Campaign, CampaignTrace } from './campaign.types';
import { MongoError } from '../../common/errors';

export class CampaignRepository extends BaseRepository<Campaign> {
  constructor(collection: Collection<Campaign>) {
    super(collection);
  }

  async findByCampaignId(campaignId: string, limitTraces?: number): Promise<Campaign | null> {
    const campaign = limitTraces
      ? await this.collection.findOne(
          { campaignId: campaignId },
          { projection: { traces: { $slice: limitTraces } } },
        )
      : await this.collection.findOne({ campaignId: campaignId });

    if (!campaign) {
      throw new MongoError(`Missing campaign with campaignId: ${campaignId}`);
    }
    return campaign;
  }

  async appendTrace(campaignId: string, trace: CampaignTrace): Promise<void> {
    const result = await this.collection.updateOne(
      { campaignId: campaignId },
      { $push: { traces: trace } },
    );

    if (result.modifiedCount === 0) {
      throw new MongoError(`Missing campaign with campaignId: ${campaignId}`);
    }
  }
}
