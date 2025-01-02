import { LoggerService } from '../../common';
import { Impression, ImpressionEvent } from './ad.types';
import { ImpressionRepository } from './impression.repository';

export class ImpressionService {
  private logger = LoggerService.getLogger('features.ad.ImpressionService');

  constructor(private readonly impressionRepository: ImpressionRepository) {}

  async capture(impressionEvent: ImpressionEvent): Promise<ImpressionEvent> {
    this.logger.info('Capturing impression event', impressionEvent);

    const impression: Impression = { ...impressionEvent };

    await this.impressionRepository.create(impression);
    return impressionEvent;
  }
}
