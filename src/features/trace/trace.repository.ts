import { BaseRepository } from '../base.repository';
import { Trace } from './trace.types';
import { Collection } from 'mongodb';

export class TraceRepository extends BaseRepository<Trace> {
  constructor(collection: Collection<Trace>) {
    super(collection);
  }
}
