import { ObjectId } from '@fastify/mongodb';
import { addDays } from 'date-fns/addDays';
import { endOfDay } from 'date-fns/endOfDay';
import { startOfDay } from 'date-fns/startOfDay';
import { Filter } from 'mongodb';
import { AppConfig } from '../../../app.types';
import { LoggerService } from '../../../common';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../../common/errors';
import { CampaignRepository } from './campaign.repository';
import { DemandRepository } from '../demand/demand.repository';
import {
  Campaign,
  CampaignContactInfoDto,
  CampaignDateProposal,
  CampaignDto,
  CampaignQueryDto,
  CampaignRole,
  CampaignStatus,
  OfferDto,
} from '../marketplace.types';
import { UserRepository } from '../../user/user.repository';
import { HookRepository } from '../../hook/hook.repository';

export class CampaignService {
  private logger = LoggerService.getLogger('feature.marketplace.campaign.CampaignService');

  constructor(
    private readonly campaignRepository: CampaignRepository,
    private readonly demandRepository: DemandRepository,
    private readonly hookRepository: HookRepository,
    private readonly userRepository: UserRepository,
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
    if (!offer.hookId) {
      this.logger.error('Offer does not have a hookId:', offer);
      throw new BadRequestError('Offer does not have a hookId');
    }
    const demand = await this.demandRepository.findById(offer.demandId);
    if (!demand) {
      this.logger.error('Demand not found:', offer.demandId);
      throw new NotFoundError('Demand not found: ' + offer.demandId);
    }
    const hook = await this.hookRepository.findById(offer.hookId);

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
      destinationUrl: hook?.domain || 'Missing URL',
      trackingUrl: this.config.apiUrl + '/flows?utm_campaign=' + utmCampaign,
      providerId: offer.providerId,
      seekerId: demand?.userId,
      status: CampaignStatus.PENDING,
      startDate: startDate,
      endDate: endDate,
    };

    this.logger.info('Creating campaign from offer:', campaign);
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

  /**
   * Propose a start date for the campaign.
   * - Only provider or seeker can propose start date
   * - Cannot propose start date if it is not in pending or paused status
   * - Cannot propose start date if it is already proposed
   *
   * @param campaignId
   * @param param1
   * @param userId
   * @returns
   */
  async proposeStartDate(campaignId: string, { startDate }: { startDate: Date }, userId: string): Promise<CampaignDateProposal> {
    this.logger.info('Proposing start date:', { campaignId, startDate, userId });

    const user = await this.userRepository.findByUserId(userId);
    if (!user) {
      this.logger.error('User not found:', userId);
      throw new NotFoundError('User not found: ' + userId);
    }
    const campaign = await this.campaignRepository.findById(campaignId);
    if (!campaign) {
      this.logger.error('Campaign not found:', campaignId);
      throw new NotFoundError('Campaign not found: ' + campaignId);
    }

    this.validateStartDateProposal(campaign, startDate, userId);

    const userRole = campaign.providerId === userId ? 'provider' : 'seeker';

    const dateProposal: CampaignDateProposal = {
      proposedByUserId: userId,
      proposedByRole: userRole,
      proposedByName: user.email,
      proposedStartDate: startOfDay(startDate),
      status: 'pending',
      proposedAt: new Date(),
    };

    const campaignUpdate: Partial<Campaign> = {
      currentDateProposal: dateProposal,
    };

    const updatedCampaign = await this.campaignRepository.updateV2(campaignId, campaignUpdate);
    this.logger.info('Updated campaign with date proposal:', { updatedCampaign });

    return dateProposal;
  }

  /**
   * Respond to a date proposal.
   * - Only provider or seeker can respond to date proposal
   * - Cannot respond to own date proposal
   * - Cannot respond to date proposal if it is not pending
   *
   * @param campaignId
   * @param param1
   * @param userId
   * @returns
   */
  async respondToDateProposal(
    campaignId: string,
    { status }: { status: 'accepted' | 'rejected' },
    userId: string
  ): Promise<CampaignDateProposal> {
    this.logger.info('Responding to date proposal:', { campaignId, status, userId });
    const user = await this.userRepository.findByUserId(userId);
    if (!user) {
      this.logger.error('User not found:', userId);
      throw new NotFoundError('User not found: ' + userId);
    }
    const campaign = await this.campaignRepository.findById(campaignId);
    if (!campaign) {
      this.logger.error('Campaign not found:', campaignId);
      throw new NotFoundError('Campaign not found: ' + campaignId);
    }

    if (userId !== campaign.providerId && userId !== campaign.seekerId) {
      this.logger.error('User not allowed to respond to date proposal:', { userId, campaign });
      throw new ForbiddenError('Only provider or seeker can respond to date proposal');
    }

    if (campaign.currentDateProposal?.status !== 'pending') {
      this.logger.error('Date proposal is not pending:', campaign.currentDateProposal);
      throw new BadRequestError('Date proposal is not pending');
    }

    if (userId === campaign.currentDateProposal.proposedByUserId) {
      this.logger.error('User cannot respond to their own date proposal:', { userId, campaign });
      throw new ForbiddenError('User cannot respond to their own date proposal');
    }

    const isAccepted = status === 'accepted';

    const campaignUpdate: Partial<Campaign> = {
      ...(isAccepted && {
        startDate: startOfDay(campaign.currentDateProposal.proposedStartDate),
        endDate: endOfDay(addDays(campaign.currentDateProposal.proposedStartDate, campaign.duration - 1)),
      }),
      currentDateProposal: {
        ...campaign.currentDateProposal,
        status,
      },
    };

    this.logger.info('Updating campaign with date proposal:', { campaignId, campaignUpdate });

    const updatedCampaign = await this.campaignRepository.updateV2(campaignId, campaignUpdate);
    return updatedCampaign?.currentDateProposal!;
  }

  async updateContactInfo(
    campaignId: string,
    { phoneNumber }: { phoneNumber: string },
    userId: string
  ): Promise<CampaignContactInfoDto | null> {
    const campaign = await this.campaignRepository.findById(campaignId);
    if (!campaign) {
      this.logger.error('Campaign not found:', campaignId);
      throw new NotFoundError('Campaign not found: ' + campaignId);
    }

    const role = this.resolveRole(userId, campaign);

    const contactInfo: CampaignContactInfoDto = {
      [role]: {
        phoneNumber: phoneNumber,
        sharedAt: new Date(),
      },
    };
    const updatedCampaign = await this.campaignRepository.updateV2(campaignId, {
      contactInfo: {
        ...campaign.contactInfo,
        ...contactInfo,
      },
    });

    this.logger.info('Updated campaign with contact info:', { updatedCampaign });
    return updatedCampaign?.contactInfo!;
  }

  /**
   * Validate start date proposal
   * - Only provider or seeker can propose start date
   * - Start date cannot be in the past
   * - Start date cannot be less than 7 days from now
   * - Can change start date only if campaign is in pending or paused status
   *
   * @param campaign
   * @param startDate
   * @param userId
   */
  private validateStartDateProposal(campaign: Campaign, startDate: Date, userId: string): void {
    const now = new Date();
    const startDateOffset = addDays(now, CampaignService.START_DAY_OFFSET);

    if (userId !== campaign.providerId && userId !== campaign.seekerId) {
      this.logger.error('User not allowed to propose start date:', { userId, campaign });
      throw new ForbiddenError('Only provider or seeker can propose start date');
    }
    if (startDate < now) {
      this.logger.error('Start date cannot be in the past:', startDate);
      throw new BadRequestError('Start date cannot be in the past');
    }
    if (startDate < startDateOffset) {
      this.logger.error(`Start date cannot be less than ${CampaignService.START_DAY_OFFSET} days from now:`, startDate);
      throw new BadRequestError(`Start date cannot be less than ${CampaignService.START_DAY_OFFSET} days from now`);
    }
    if (campaign.status !== CampaignStatus.PENDING && campaign.status !== CampaignStatus.PAUSED) {
      this.logger.error(`Cannot change start date for campaign in ${campaign.status} status`, { campaignId: campaign._id });
      throw new BadRequestError(`Cannot change start date for campaign in ${campaign.status} status`);
    }
  }

  private resolveRole(userId: string, campaign: Campaign): CampaignRole {
    if (userId === campaign.providerId) {
      return CampaignRole.PROVIDER;
    }
    if (userId === campaign.seekerId) {
      return CampaignRole.SEEKER;
    }
    throw new ForbiddenError('User not allowed to access campaign');
  }
}
