import { FastifyReply, FastifyRequest } from 'fastify';
import { AdService } from './ad.service';
import { AdRequest } from './markup/ad.markup.types';
import { LoggerService } from '../../common/logger.service';

export interface AdRequestParams {
  // Consumer info
  fingerprintId: string;
  deviceType?: string;
  ipAddress?: string;
  userAgent?: string;
  geo?: string;
  countryCode?: string;
  city?: string;

  // Slot info
  publisherId?: string; // Unique identifier for the publisher
  placementId?: string; // Specific location/slot on the page
  targetId: string; // ID of the container element
  pageUrl?: string; // Current page URL
}

export class AdController {
  private logger = LoggerService.getLogger('feature.ad.AdController');

  constructor(private adService: AdService) {}

  async serve(
    request: FastifyRequest<{
      Querystring: AdRequestParams;
    }>,
    reply: FastifyReply,
  ) {
    try {
      this.logger.info('Serving ad', { ...request.query });

      const adRequest: AdRequest = { ...request.query };
      const adCode = await this.adService.createAdCode(adRequest);

      reply
        .header('Content-Type', 'application/javascript')
        .header('Cache-Control', 'no-cache')
        .send(adCode);
    } catch (error) {
      this.logger.error('Failed to serve ad', error);
    }
  }
}
