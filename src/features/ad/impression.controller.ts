import { FastifyReply, FastifyRequest } from 'fastify';

import { LoggerService } from '../../common';
import { ImpressionService } from './impression.service';
import { ImpressionEvent } from './ad.types';

export class ImpressionController {
  private logger = LoggerService.getLogger('features.impression.ImpressionController');

  constructor(private readonly impressionService: ImpressionService) {}

  async capture(
    request: FastifyRequest<{
      Querystring: ImpressionEvent;
    }>,
    reply: FastifyReply,
  ): Promise<void> {
    const impressionData = request.query;

    this.logger.info('Impression:', {
      ...impressionData,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      referer: request.headers.referer,
    });

    this.impressionService.capture(impressionData);

    // Create 1x1 transparent GIF
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');

    reply
      .header('Content-Type', 'image/gif')
      .header('Content-Length', pixel.length)
      .header('Cache-Control', 'no-cache, no-store, must-revalidate')
      .header('Pragma', 'no-cache')
      .header('Expires', '0')
      .send(pixel);
  }
}
