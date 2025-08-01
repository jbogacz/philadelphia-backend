import { FastifyReply, FastifyRequest } from 'fastify';
import { AppConfig } from '../../app.types';
import { ErrorDto } from '../../common/errors';
import { WidgetDto, WidgetQueryDto } from './widget.types';
import { getAuth } from '@clerk/fastify';
import { WidgetService } from './widget.service';
import { WidgetComponentService } from './widget.component.service';

export class WidgetController {
  constructor(
    private readonly widgetService: WidgetService,
    private readonly widgetCodeService: WidgetComponentService,
    private readonly config: AppConfig
  ) {}

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

  async update(
    request: FastifyRequest<{ Body: WidgetDto; Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<
    FastifyReply<{
      Reply: WidgetDto | ErrorDto;
    }>
  > {
    const widget = await this.widgetService.update(request.params.id, request.body);
    return widget ? reply.code(200).send(widget) : reply.code(404).send({ error: 'Widget not found', code: 404 });
  }

  async findById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<
    FastifyReply<{
      Reply: WidgetDto | ErrorDto;
    }>
  > {
    const widget = await this.widgetService.findById(request.params.id);
    return widget ? reply.code(200).send(widget) : reply.code(404).send({ error: 'Widget not found', code: 404 });
  }

  async generate(
    request: FastifyRequest<{ Querystring: WidgetQueryDto }>,
    reply: FastifyReply
  ): Promise<
    FastifyReply<{
      Reply: string | ErrorDto;
    }>
  > {
    const code = await this.widgetCodeService.generate(request.query.widgetKey);
    if (!code) {
      return reply.code(400).send();
    }
    return reply.code(200).send(code);
  }
}
