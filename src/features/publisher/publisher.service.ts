import { PublisherRepository } from './publisher.repository';
import { Publisher } from './publisher.types';

export class PublisherService {
  constructor(private readonly publisherRepository: PublisherRepository) {}

  async findById(publisherId: string): Promise<Publisher> {
    return this.publisherRepository.findByPublisherId(publisherId);
  }
}
