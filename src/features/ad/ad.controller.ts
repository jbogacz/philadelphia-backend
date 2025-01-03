import { FastifyReply, FastifyRequest } from 'fastify';
import { AdService } from './ad.service';
import { LoggerService } from '../../common/logger.service';
import { Static, Type } from '@sinclair/typebox';
import { TypeCompiler } from '@sinclair/typebox/compiler';

const AdQuerySchema = Type.Object({
  publisherId: Type.String({ minLength: 1 }),
  targetId: Type.String({ minLength: 1 }),
});

export type AdQuery = Static<typeof AdQuerySchema>;

export class AdController {
  private logger = LoggerService.getLogger('feature.ad.AdController');
  private validator = TypeCompiler.Compile(AdQuerySchema);

  constructor(private adService: AdService) {}

  async serve(
    request: FastifyRequest<{
      Querystring: AdQuery;
    }>,
    reply: FastifyReply,
  ) {
    try {
      this.logger.info('Serving ad', request.query);

      if (!this.validator.Check(request.query)) {
        return reply.code(400).send(this.validator.Errors);
      };

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
