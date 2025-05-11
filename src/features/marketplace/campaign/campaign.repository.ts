import { BaseRepository } from '../../base.repository';
import { Campaign } from '../marketplace.types';
import { Collection } from 'mongodb';

export class CampaignRepository extends BaseRepository<Campaign> {
  constructor(collection: Collection<Campaign>) {
    super(collection);
  }

  async findByUtmCampaign(utmCampaign: string): Promise<Campaign | null> {
    return this.queryOne({ utmCampaign });
  }
}
