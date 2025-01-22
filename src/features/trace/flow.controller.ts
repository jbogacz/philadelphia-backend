import { FastifyReply, FastifyRequest } from 'fastify';
import { FlowDto } from './flow.types';
import { LoggerService } from '../../common';

export class FlowController {
  private logger = LoggerService.getLogger('feature.trace.FlowController');

  async capture(
    request: FastifyRequest<{ Querystring: FlowDto }>,
    reply: FastifyReply,
  ): Promise<void> {
    this.logger.info('Flow captured', request.query);

    const html = `
      <!DOCTYPE html>
        <body>
          <script>
          // Collect data immediately

          // 1. Calculate fingerprint
          // - append and invoke the fingerprintJS

          // 2. Call backend with fingerprintId, traceId, campaignId and publisherId
          // - save trace related with consumer fingerprint
          // - save audience traffic that is an effect of publisher advertising

          // 3. Redirect to campaign url

          // Immediate redirect
          // window.location.href = 'http://localhost:3000/documentation';
          </script>
        </body>
      </html>
  `;
    reply.code(200).type('text/html').send(html);
  }
}
