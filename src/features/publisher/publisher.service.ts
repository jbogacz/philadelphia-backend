import { Publisher } from './publisher.types';

export class PublisherService {
  async findById(publisherId: string): Promise<Publisher> {
    return {
      publisherId: publisherId,
    };
  }
}
