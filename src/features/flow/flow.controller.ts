import { FastifyReply, FastifyRequest } from 'fastify';
import { FlowDto } from './flow.types';
import { FlowService } from './flow.service';
import { LoggerService } from '../../common';

export class FlowController {
  private logger = LoggerService.getLogger('feature.trace.FlowController');

  constructor(private readonly flowService: FlowService) {}

  async serveCode(
    request: FastifyRequest<{ Querystring: FlowDto }>,
    reply: FastifyReply,
  ): Promise<void> {
    const flowCode = await this.flowService.generate(request.query);

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

          // Dynamic code  
          ${flowCode}
          </script>
        </body>
      </html>
    `;
    reply.code(200).type('text/html').send(html);
  }
}
