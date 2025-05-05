import { ObjectId } from '@fastify/mongodb';
import { Offer, OfferDto, OfferQueryDto, OfferStatus } from './marketplace.types';
import { OfferRepository } from './offer.repository';
import { LoggerService } from '../../common';
import { ForbiddenError, NotFoundError } from '../../common/errors';
import { DemandRepository } from './demand.repository';
import { Filter } from 'mongodb';
import { CampaignService } from './campaign/campaign.service';

export class OfferService {
  private logger = LoggerService.getLogger('feature.marketplace.OfferService');

  constructor(
    private readonly campaignService: CampaignService,
    private readonly offerRepository: OfferRepository,
    private readonly demandRepository: DemandRepository
  ) {}

  async create(dto: OfferDto): Promise<OfferDto> {
    this.logger.info('Creating offer:', dto);

    const demand = await this.demandRepository.findById(dto.demandId);
    if (!demand) {
      this.logger.error('Demand not found:', dto.demandId);
      throw new NotFoundError('Demand not found: ' + dto.demandId);
    }

    const offer = {
      ...dto,
      status: OfferStatus.PENDING,
      demandId: new ObjectId(dto.demandId),
      hookId: new ObjectId(demand.hookId),
      seekerId: demand.userId,
    } as Offer;
    const created = await this.offerRepository.createV2(offer);

    this.logger.info('Created offer:', created);
    return created as OfferDto;
  }

  async update(offerId: string, userId: string, dto: Partial<OfferDto>): Promise<OfferDto | null> {
    const offer = await this.offerRepository.findById(new ObjectId(offerId));
    if (!offer) {
      throw new NotFoundError('Offer not found: ' + offerId);
    }

    if (dto.status) {
      if (userId !== offer.seekerId) {
        throw new ForbiddenError('Only seeker can update offer status');
      }
      if (dto.status === OfferStatus.ACCEPTED) {
        await this.campaignService.createFromOffer(offer);
      }
      return this.updateStatus(offerId, userId, dto.status);
    }

    // Allow updating offer data only if the providerId (author) matches
    if (userId !== offer.providerId) {
      throw new ForbiddenError('Only provider can update offer');
    }

    const updated = await this.offerRepository.updateV2(offerId, dto);
    this.logger.info('Updated offer:', updated!);
    return updated;
  }

  async updateStatus(id: string, userId: string, status: OfferStatus): Promise<OfferDto | null> {
    const updateQuery = {
      _id: new ObjectId(id),
      seekerId: userId,
    } as Filter<Offer>;
    const updated = await this.offerRepository.updateWhereV2(updateQuery, { status });

    if (!updated) {
      this.logger.error('User not allowed to change offer status:', updateQuery);
      throw new ForbiddenError('You are not allowed to change offer status: ' + id);
    }

    this.logger.info('Updated offer status:', updated);
    return updated;
  }

  async query(query: OfferQueryDto): Promise<OfferDto[]> {
    const pipeline = [
      {
        $match: query,
      },
      {
        $lookup: {
          from: 'demands',
          localField: 'demandId',
          foreignField: '_id',
          as: 'demand',
        },
      },
      {
        $unwind: '$demand',
      },
    ];
    return this.offerRepository.aggregate(pipeline);
  }

  async findById(id: string): Promise<OfferDto | null> {
    return this.offerRepository.findById(id);
  }

  async delete(id: string, providerId: string): Promise<void> {
    const offer = await this.offerRepository.queryOne({ _id: ObjectId.createFromHexString(id), providerId });
    if (!offer) {
      this.logger.error('Offer not found:', id);
      throw new NotFoundError('Offer not found: ' + id);
    }

    await this.offerRepository.delete(id);
    this.logger.info('Deleted offer:', { id, providerId });
  }
}
