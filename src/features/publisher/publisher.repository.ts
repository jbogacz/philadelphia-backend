import { BaseRepository } from '../base.repository';
import { Publisher } from './publisher.types';
import { Collection, MongoError } from 'mongodb';

export class PublisherRepository extends BaseRepository<Publisher> {
  constructor(collection: Collection<Publisher>) {
    super(collection);
  }

  async findByPublisherId(publisherId: string): Promise<Publisher> {
    const publisher = await this.collection.findOne({ publisherId: publisherId });

    if (!publisher) {
      throw new MongoError(`Missing publisher with publisherId: ${publisherId}`);
    }
    return publisher;
  }
}
