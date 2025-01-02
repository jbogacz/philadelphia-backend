import { Collection } from 'mongodb';
import { BaseRepository } from '../base.repository';
import { Impression } from './ad.types';

export class ImpressionRepository extends BaseRepository<Impression> {
  constructor(collection: Collection<Impression>) {
    super(collection);
  }
}
