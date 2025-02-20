import { BaseRepository } from '../base.repository';
import { Hook } from './hook.types';
import { Collection } from 'mongodb';

export class HookRepository extends BaseRepository<Hook> {
  constructor(collection: Collection<Hook>) {
    super(collection);
  }
}
