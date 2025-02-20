import { FastifyReply, FastifyRequest } from 'fastify';
import { AppConfig } from '../../app.types';
import { ErrorDto } from '../../common/errors';
import { WidgetDto } from './widget.types';
import { getAuth } from '@clerk/fastify';
import { WidgetService } from './widget.service';

export class WidgetController {
  constructor(private readonly widgetService: WidgetService, private readonly config: AppConfig) {}

  async register(
    request: FastifyRequest<{}>,
    reply: FastifyReply
  ): Promise<
    FastifyReply<{
      Reply: WidgetDto | ErrorDto;
    }>
  > {
    const userId = this.config.isDevelopment() ? request.headers['x-user-id'] : getAuth(request).userId;
    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized', code: 401 });
    }

    const widget = await this.widgetService.register(userId as string);
    return reply.code(200).send(widget);
  }
}
