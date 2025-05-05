import { LoggerService } from '../../../common';
import { Campaign } from '../marketplace.types';
import { CampaignRepository } from './campaign.repository';

export class CampaignSchedulerService {
  private logger = LoggerService.getLogger('feature.marketplace`.campaign`.CampaignSchedulerService');

  constructor(private readonly campaignRepository: CampaignRepository) {}

  async activateCampaigns(): Promise<Campaign[]> {
    this.logger.info('Run activate campaigns...');
    return [];
  }

  async completeCampaigns(): Promise<Campaign[]> {
    this.logger.info('Run complete campaigns...');
    return [];
  }
}
