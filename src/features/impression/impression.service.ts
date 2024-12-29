import { LoggerService } from "../../common";
import { ImpressionEvent } from "./impression.types";

export class ImpressionService {
  private logger = LoggerService.getLogger('features.impression.ImpressionService');

  async capture(impressionEvent: ImpressionEvent): Promise<ImpressionEvent> {
    this.logger.info('Capturing impression', impressionEvent);
    return impressionEvent;
  }
}
