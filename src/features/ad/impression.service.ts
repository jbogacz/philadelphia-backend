import { LoggerService } from '../../common';
import { ImpressionEvent } from './ad.types';

export class ImpressionService {
  private logger = LoggerService.getLogger('features.impression.ImpressionService');

  async capture(impressionEvent: ImpressionEvent): Promise<ImpressionEvent> {
    this.logger.info('Capturing impression', impressionEvent);
    return impressionEvent;
  }
}
