import { ObjectId } from '@fastify/mongodb';
import { Offer, OfferDto, OfferQueryDto, OfferStatus } from './marketplace.types';
import { OfferRepository } from './offer.repository';
import { LoggerService } from '../../common';
import { NotFoundError } from '../../common/errors';
import { DemandRepository } from './demand.repository';
import { Filter } from 'mongodb';

export class OfferService {
  private logger = LoggerService.getLogger('feature.marketplace.OfferService');

  constructor(private readonly offerRepository: OfferRepository, private readonly demandRepository: DemandRepository) {}

  async create(dto: OfferDto): Promise<OfferDto> {
    this.logger.info('Creating offer:', dto);

    const demand = await this.demandRepository.findByPrimaryId(dto.demandId);
    if (!demand) {
      this.logger.error('Demand not found:', dto.demandId);
      throw new NotFoundError('Demand not found: ' + dto.demandId);
    }

    const offer = {
      ...dto,
      status: OfferStatus.PENDING,
      demandId: new ObjectId(dto.demandId),
      hookId: new ObjectId(demand.hookId),
      requesterId: demand.userId,
    };
    const created = await this.offerRepository.createV2(offer);

    this.logger.info('Created offer:', created);
    return created as unknown as OfferDto;
  }

  async update(id: string, dto: OfferDto): Promise<OfferDto> {
    // Allow updating only if the providerId matches
    const updateQuery = {
      _id: new ObjectId(id),
      providerId: dto.providerId,
    } as Filter<any>;

    const updated = await this.offerRepository.updateWhereV2(updateQuery, dto);
    if (!updated) {
      this.logger.error('Offer not found:', updateQuery);
      throw new NotFoundError('Offer not found: ' + id);
    }

    this.logger.info('Updated offer:', updated);
    return updated as unknown as OfferDto;
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
    return this.offerRepository.findByPrimaryId(id) as unknown as OfferDto;
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
