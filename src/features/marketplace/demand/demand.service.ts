import { LoggerService } from '../../common';
import { NotFoundError } from '../../common/errors';
import { DemandRepository } from './demand.repository';
import { Demand, DemandDto, DemandQueryDto } from './marketplace.types';
import { ObjectId } from 'mongodb';
import { DemandStatus } from './marketplace.types';

export class DemandService {
  private logger = LoggerService.getLogger('feature.marketplace.DemandService');

  constructor(private readonly demandRepository: DemandRepository) {}

  async create(dto: DemandDto): Promise<DemandDto> {
    const demand = {
      ...dto,
      status: DemandStatus.OPEN,
      hookId: new ObjectId(dto.hookId),
    } as any;
    const created = await this.demandRepository.create(demand as Demand);

    this.logger.info('Created demand:', created);
    return created;
  }

  async update(id: string, demand: DemandDto): Promise<DemandDto> {
    // Allow updating only if the userId matches
    const updateQuery = {
      _id: ObjectId.createFromHexString(id),
      userId: demand.userId,
    };

    const toUpdate: Partial<Omit<Demand, 'hookId' | 'userId'>> = demand;
    const updated = await this.demandRepository.updateWhere(updateQuery, toUpdate);
    if (!updated) {
      this.logger.error('Demand not found:', updateQuery);
      throw new NotFoundError('Demand not found: ' + id);
    }

    this.logger.info('Updated demand:', updated);
    return updated;
  }

  async query(query: DemandQueryDto): Promise<DemandDto[]> {
    return this.demandRepository.query(query);
  }

  async findById(id: string): Promise<DemandDto | null> {
    return this.demandRepository.findById(id);
  }

  async delete(id: string, userId: string): Promise<void> {
    const demand = await this.demandRepository.findById(id, userId);
    if (!demand) {
      this.logger.error('Demand not found:', id);
      throw new NotFoundError('Demand not found: ' + id);
    }

    await this.demandRepository.delete(id);
    this.logger.info('Deleted demand:', { id, userId });
  }
}
