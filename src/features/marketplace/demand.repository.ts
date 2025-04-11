import { BaseRepository } from '../base.repository';
import { Demand } from './marketplace.types';
import { Collection } from 'mongodb';

export class DemandRepository extends BaseRepository<Demand> {
  constructor(collection: Collection<Demand>) {
    super(collection);
  }
}
