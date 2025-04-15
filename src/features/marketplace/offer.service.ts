import { ObjectId } from '@fastify/mongodb';
import { Offer, OfferDto, OfferStatus } from './marketplace.types';
import { OfferRepository } from './offer.repository';
import { LoggerService } from '../../common';
import { NotFoundError } from '../../common/errors';
import { DemandRepository } from './demand.repository';

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
      demandId: ObjectId.createFromHexString(dto.demandId),
    } as any;
    const created = await this.offerRepository.create(offer as Offer);

    this.logger.info('Created offer:', created);
    return {
      ...created,
      createdAt: created.createdAt?.toISOString(),
      updatedAt: created.updatedAt?.toISOString(),
    };
  }

  async update(id: string, offer: OfferDto): Promise<OfferDto> {
    // Allow updating only if the providerId matches
    const updateQuery: any = {
      _id: ObjectId.createFromHexString(id),
      providerId: offer.providerId,
    };

    const updated = await this.offerRepository.updateWhere(updateQuery, offer as Offer);
    if (!updated) {
      this.logger.error('Offer not found:', updateQuery);
      throw new NotFoundError('Offer not found: ' + id);
    }

    this.logger.info('Updated offer:', updated);
    return {
      ...updated,
      createdAt: updated.createdAt?.toISOString(),
      updatedAt: updated.updatedAt?.toISOString(),
    };
  }

  async findAllByUserId(userId: string): Promise<OfferDto[]> {
    const offers = await this.offerRepository.query({ providerId: userId });
    return offers.map((offer) => ({
      ...offer,
      createdAt: offer.createdAt?.toISOString(),
      updatedAt: offer.updatedAt?.toISOString(),
    }));
  }

  async findById(id: string): Promise<OfferDto | null> {
    const offer = await this.offerRepository.findByPrimaryId(id);
    return (
      offer && {
        ...offer,
        createdAt: offer.createdAt?.toISOString(),
        updatedAt: offer.updatedAt?.toISOString(),
      }
    );
  }

  async delete(id: string, providerId: string): Promise<void> {
    const offer = await this.offerRepository.queryOne({ _id: ObjectId.createFromHexString(id), providerId } as any);
    if (!offer) {
      this.logger.error('Offer not found:', id);
      throw new NotFoundError('Offer not found: ' + id);
    }

    await this.offerRepository.delete(id);
    this.logger.info('Deleted offer:', { id, providerId });
  }
}
