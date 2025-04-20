import { CampaignRepository } from './campaign.repository';
import { CampaignDto, CampaignQueryDto, CampaignStatus } from './marketplace.types';
import { ObjectId } from '@fastify/mongodb';

export class CampaignService {
  constructor(private readonly campaignRepository: CampaignRepository) {}

  async create(dto: CampaignDto): Promise<CampaignDto> {
    const campaign = {
      ...dto,
      hookId: new ObjectId(dto.hookId),
      demandId: new ObjectId(dto.demandId),
      offerId: new ObjectId(dto.offerId),
      status: CampaignStatus.PENDING,
    };
    return this.campaignRepository.createV2(campaign);
  }

  async update(id: string, campaign: CampaignDto): Promise<CampaignDto | null> {
    return this.campaignRepository.updateV2(id, campaign);
  }

  async query(query: CampaignQueryDto): Promise<CampaignDto[]> {
    return this.campaignRepository.queryV2(query);
  }
}
