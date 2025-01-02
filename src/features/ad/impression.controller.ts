import { FastifyReply, FastifyRequest } from 'fastify';

import { ImpressionEvent } from './ad.types';
import { ImpressionService } from './impression.service';

// 1x1 transparent GIF
const TRANSPARENT_GIF_BUFFER = Buffer.from([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00, 0xff, 0xff, 0xff,
  0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x00, 0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00,
  0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44, 0x01, 0x00, 0x3b,
]);

export class ImpressionController {
  constructor(private readonly impressionService: ImpressionService) {}

  async capture(
    request: FastifyRequest<{
      Querystring: ImpressionEvent;
    }>,
    reply: FastifyReply,
  ): Promise<void> {
    const impressionEvent = request.query;

    this.impressionService.capture(impressionEvent);

    if (process.env.NODE_ENV === 'development') {
      reply.header('X-Trace-Id', impressionEvent.traceId);
      reply.header('X-Debug-Info', JSON.stringify(impressionEvent));
    }

    reply
      .header('Content-Type', 'image/gif')
      .header('Content-Length', TRANSPARENT_GIF_BUFFER.length)
      .header('Cache-Control', 'no-cache, no-store, must-revalidate')
      .header('Pragma', 'no-cache')
      .header('Expires', '0')
      .send(TRANSPARENT_GIF_BUFFER);
  }
}
