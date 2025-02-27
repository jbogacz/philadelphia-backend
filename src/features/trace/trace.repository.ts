import { BaseRepository } from '../base.repository';
import { Collection } from 'mongodb';
import { Trace } from './trace.types';

export class TraceRepository extends BaseRepository<Trace> {
  constructor(collection: Collection<Trace>) {
    super(collection);
  }
}
