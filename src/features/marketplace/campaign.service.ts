import { ObjectId } from '@fastify/mongodb';
import { CampaignRepository } from './campaign.repository';
import { DemandRepository } from './demand.repository';
import { Campaign, CampaignDto, CampaignQueryDto, CampaignStatus, Offer, OfferDto } from './marketplace.types';
import { OfferRepository } from './offer.repository';
import { Filter } from 'mongodb';
import { ForbiddenError, NotFoundError } from '../../common/errors';

export class CampaignService {
  constructor(
    private readonly campaignRepository: CampaignRepository,
    private readonly demandRepository: DemandRepository,
    private readonly offerRepository: OfferRepository
  ) {}

  async createFromOffer(offer: OfferDto): Promise<Campaign | null> {
    const demand = await this.demandRepository.findById(offer.demandId);
    const campaign: Campaign = {
      demandId: offer.demandId,
      offerId: new ObjectId(offer._id),
      hookId: offer.hookId,
      goal: offer.trafficVolume,
      price: offer.price,
      duration: offer.duration,
      trafficSources: offer.trafficSources,
      title: demand?.title || 'Missing title',
      providerId: offer.providerId,
      requesterId: offer.requesterId,
      trackingUrl: 'TODO: generate tracking URL',
      status: CampaignStatus.PENDING,
    };
    return this.campaignRepository.createV2(campaign);
  }

  async update(id: string, campaign: CampaignDto, userId: string): Promise<CampaignDto | null> {
    const existingCampaign = await this.campaignRepository.findById(id);
    if (!existingCampaign) {
      throw new NotFoundError('Campaign not found: ' + id);
    }
    if (userId !== existingCampaign.providerId && userId !== existingCampaign.requesterId) {
      throw new ForbiddenError('Only provider or requester can update campaign');
    }
    if (campaign.status && campaign.status !== existingCampaign.status && userId !== existingCampaign.requesterId) {
      throw new ForbiddenError('Only requester can update campaign status');
    }
    if (existingCampaign.status === CampaignStatus.CANCELLED || existingCampaign.status === CampaignStatus.COMPLETED) {
      throw new ForbiddenError('Cannot update campaign in final status');
    }
    return this.campaignRepository.updateV2(id, campaign);
  }

  async query(query: CampaignQueryDto, userId: string): Promise<CampaignDto[]> {
    const filter: Filter<Campaign> = {
      ...query,
      ...{ $or: [{ providerId: userId }, { requesterId: userId }] },
    };
    return this.campaignRepository.queryV2(filter);
  }

  async findById(id: string): Promise<Campaign | null> {
    return this.campaignRepository.findById(id);
  }
}
