import { LoggerService } from '../../common';
import { NotFoundError } from '../../common/errors';
import { DemandRepository } from './demand.repository';
import { Demand, DemandDto } from './marketplace.types';
import { ObjectId } from 'mongodb';
import { DemandStatus } from './marketplace.types';

export class DemandService {
  private logger = LoggerService.getLogger('feature.marketplace.DemandService');

  constructor(private readonly demandRepository: DemandRepository) {}

  async create(dto: DemandDto): Promise<DemandDto> {
    const demand = {
      ...dto,
      status: DemandStatus.OPEN,
      hookId: ObjectId.createFromHexString(dto.hookId),
    } as any;
    const created = await this.demandRepository.create(demand as Demand);

    this.logger.info('Created demand:', created);
    return {
      ...created,
      createdAt: created.createdAt?.toISOString(),
      updatedAt: created.updatedAt?.toISOString(),
    };
  }

  async update(id: string, demand: DemandDto): Promise<DemandDto> {
    // Allow updating only if the userId matches
    const updateQuery: any = {
      _id: ObjectId.createFromHexString(id),
      userId: demand.userId,
    };

    const updated = await this.demandRepository.updateWhere(updateQuery, demand as Demand);
    if (!updated) {
      this.logger.error('Demand not found:', updateQuery);
      throw new NotFoundError('Demand not found: ' + id);
    }

    this.logger.info('Updated demand:', updated);
    return {
      ...updated,
      createdAt: updated.createdAt?.toISOString(),
      updatedAt: updated.updatedAt?.toISOString(),
    };
  }

  async findAllByUserId(userId: string): Promise<DemandDto[]> {
    const demands = await this.demandRepository.query({ userId });
    return demands.map((demand) => ({
      ...demand,
      createdAt: demand.createdAt?.toISOString(),
      updatedAt: demand.updatedAt?.toISOString(),
    }));
  }
}
