import { BaseRepository } from '../base.repository';
import { Collection } from 'mongodb';
import { Partnership } from './partnership.types';

export class PartnershipRepository extends BaseRepository<Partnership> {
  constructor(collection: Collection<Partnership>) {
    super(collection);
  }

  async findAllBySourceWidgetKey(widgetKey: string): Promise<Partnership[]> {
    return this.collection
      .find({
        sourceWidgetKey: widgetKey,
      })
      .toArray();
  }
}
