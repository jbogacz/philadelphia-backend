import { ObjectId } from '@fastify/mongodb';
import { CampaignRepository } from './campaign.repository';
import { DemandRepository } from './demand.repository';
import { Campaign, CampaignDto, CampaignQueryDto, CampaignStatus, Offer, OfferDto } from './marketplace.types';
import { OfferRepository } from './offer.repository';
import { Filter } from 'mongodb';

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

  async update(id: string, campaign: CampaignDto): Promise<CampaignDto | null> {
    return this.campaignRepository.updateV2(id, campaign);
  }

  async query(userId: string, query: CampaignQueryDto): Promise<CampaignDto[]> {
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
