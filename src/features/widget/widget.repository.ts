import { BaseRepository } from '../base.repository';
import { Collection } from 'mongodb';
import { Widget } from './widget.types';

export class WidgetRepository extends BaseRepository<Widget> {
  constructor(collection: Collection<Widget>) {
    super(collection);
  }

  async query(query: { userId: string; status: string }): Promise<Widget[]> {
    return this.collection.find(query ? { query } : {}).toArray();
  }
}
