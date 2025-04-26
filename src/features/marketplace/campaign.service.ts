import { ObjectId } from '@fastify/mongodb';
import { CampaignRepository } from './campaign.repository';
import { DemandRepository } from './demand.repository';
import { Campaign, CampaignDto, CampaignQueryDto, CampaignStatus, Offer, OfferDto } from './marketplace.types';
import { OfferRepository } from './offer.repository';
import { Filter } from 'mongodb';
import { ForbiddenError, NotFoundError } from '../../common/errors';
import { startOfDay } from 'date-fns/startOfDay';
import { endOfDay } from 'date-fns/endOfDay';
import { addDays } from 'date-fns/addDays';
import { AppConfig } from '../../app.types';

export class CampaignService {
  constructor(
    private readonly campaignRepository: CampaignRepository,
    private readonly demandRepository: DemandRepository,
    private readonly config: AppConfig
  ) {}

  static START_DAY_OFFSET = 7;

  /**
   * Create a campaign from an offer where startDate is set as default 7 days from now
   * and endDate is set as the duration of the offer.
   *
   * @param offer
   * @returns
   */
  async createFromOffer(offer: OfferDto): Promise<Campaign | null> {
    const demand = await this.demandRepository.findById(offer.demandId);

    // Start at the beginning of the day
    const startDate = startOfDay(addDays(new Date(), CampaignService.START_DAY_OFFSET));

    // Close before end of the day
    const endDate = endOfDay(addDays(startDate, offer.duration - 1));

    // We don't want to expose any id to public
    const utmCampaign = crypto.randomUUID();

    const campaign: Campaign = {
      demandId: offer.demandId,
      offerId: new ObjectId(offer._id),
      hookId: offer.hookId,
      goal: offer.trafficVolume,
      price: offer.price,
      duration: offer.duration,
      trafficSources: offer.trafficSources,
      title: demand?.title || 'Missing title',
      utmCampaign: utmCampaign,
      trackingUrl: this.config.apiUrl + '/flows?utm_campaign=' + utmCampaign,
      providerId: offer.providerId,
      seekerId: offer.seekerId,
      status: CampaignStatus.PENDING,
      startDate: startDate,
      endDate: endDate,
    };
    return this.campaignRepository.createV2(campaign);
  }

  /**
   * Update a campaign
   * - Only provider or seeker can update the campaign
   * - Only seeker can update the status
   * - Cannot update the campaign if it is in final status (CANCELLED or COMPLETED)
   * - Mostly, owners will update startDate and endDate
   *
   * @param id
   * @param campaign
   * @param userId
   * @returns
   */
  async update(id: string, campaign: CampaignDto, userId: string): Promise<CampaignDto | null> {
    const existingCampaign = await this.campaignRepository.findById(id);
    if (!existingCampaign) {
      throw new NotFoundError('Campaign not found: ' + id);
    }
    if (userId !== existingCampaign.providerId && userId !== existingCampaign.seekerId) {
      throw new ForbiddenError('Only provider or seeker can update campaign');
    }
    if (campaign.status && campaign.status !== existingCampaign.status && userId !== existingCampaign.seekerId) {
      throw new ForbiddenError('Only seeker can update campaign status');
    }
    if (existingCampaign.status === CampaignStatus.CANCELLED || existingCampaign.status === CampaignStatus.COMPLETED) {
      throw new ForbiddenError('Cannot update campaign in final status');
    }
    return this.campaignRepository.updateV2(id, campaign);
  }

  async query(query: CampaignQueryDto, userId: string): Promise<CampaignDto[]> {
    const filter: Filter<Campaign> = {
      ...query,
      $or: [{ providerId: userId }, { seekerId: userId }],
    };
    return this.campaignRepository.queryV2(filter);
  }

  async findById(id: string): Promise<Campaign | null> {
    return this.campaignRepository.findById(id);
  }
}
