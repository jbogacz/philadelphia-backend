import { LoggerService } from '../../../common';
import { Campaign, CampaignStatus } from '../marketplace.types';
import { CampaignRepository } from './campaign.repository';

export class CampaignSchedulerService {
  private logger = LoggerService.getLogger('feature.marketplace`.campaign`.CampaignSchedulerService');

  constructor(private readonly campaignRepository: CampaignRepository) {}

  async activateCampaigns(): Promise<Campaign[]> {
    this.logger.info('Run activate campaigns...');

    const now = new Date();
    const pendingCampaigns = await this.campaignRepository.queryV2({
      status: CampaignStatus.PENDING,
      startDate: { $lte: now },
      endDate: { $gte: now },
    });
    this.logger.info(`Found ${pendingCampaigns.length} pending campaigns to activate`);

    if (pendingCampaigns.length > 0) {
      const _ids = pendingCampaigns.map((campaign) => campaign._id);
      await this.campaignRepository.updateWhereV2({ _id: { $in: _ids } }, { status: CampaignStatus.ACTIVE });

      this.logger.info(`Activated ${pendingCampaigns.length} campaigns`);
    } else {
      this.logger.info('No pending campaigns to activate');
    }

    return pendingCampaigns;
  }

  async completeCampaigns(): Promise<Campaign[]> {
    this.logger.info('Run complete campaigns...');

    const now = new Date();
    const activeCampaigns = await this.campaignRepository.queryV2({
      status: CampaignStatus.ACTIVE,
      endDate: { $lt: now },
    });
    this.logger.info(`Found ${activeCampaigns.length} active campaigns to complete`);

    if (activeCampaigns.length > 0) {
      const _ids = activeCampaigns.map((campaign) => campaign._id);
      await this.campaignRepository.updateWhereV2({ _id: { $in: _ids } }, { status: CampaignStatus.COMPLETED });

      this.logger.info(`Completed ${activeCampaigns.length} campaigns`);
    } else {
      this.logger.info('No active campaigns to complete');
    }

    return activeCampaigns;
  }
}
