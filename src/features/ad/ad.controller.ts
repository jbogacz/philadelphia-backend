import { FastifyReply, FastifyRequest } from 'fastify';
import { AdService } from './ad.service';
import { LoggerService } from '../../common/logger.service';

export interface AdRequestParams {
  targetId: string;
  publisherId: string;
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
      this.logger.info('Serving ad', request.query);

      const publisherId = request.query.publisherId;
      const targetId = request.query.targetId;

      const markup = await this.adService.createMarkupCode(publisherId, targetId);

      reply
        .header('Content-Type', 'application/javascript')
        .header('Cache-Control', 'no-cache')
        .send(markup);
    } catch (error) {
      this.logger.error('Failed to serve ad', error);
    }
  }
}
