import { randomUUID } from 'crypto';
import { LoggerService } from '../../common';
import { NotFoundError } from '../../common/errors';
import { UserRepository } from '../user/user.repository';
import { WidgetRepository } from './widget.repository';
import { Widget, WidgetDto, WidgetStatus } from './widget.types';
import { FastifyMongoObject } from '@fastify/mongodb';
import { txTemplate } from '../base.repository';
import { AppConfig } from '../../app.types';

export class WidgetService {
  private logger = LoggerService.getLogger('feature.widget.WidgetService');

  constructor(
    private readonly mongo: FastifyMongoObject,
    private readonly config: AppConfig,
    private readonly widgetRepository: WidgetRepository,
    private readonly userRepository: UserRepository
  ) {}

  async register(userId: string): Promise<WidgetDto> {
    const user = await this.userRepository.findByUserId(userId);
    if (!user) {
      this.logger.error('User not found:', userId);
      throw new NotFoundError('User not found: ' + userId);
    }

    return txTemplate.withTransaction(this.mongo.client)(async (session) => {
      const existing = await this.widgetRepository.query(
        { userId: userId, status: WidgetStatus.PENDING, hookId: { $exists: false } },
        { session }
      );

      if (existing.length > 0) {
        this.logger.info('Return existing widget:', existing[0]);
        return existing[0];
      }

      const apiUrl = this.config.apiUrl;
      const widgetKey = randomUUID().toString();
      const widgetCode = this.buildScriptSnippet(apiUrl, widgetKey);

      const widget: Widget = {
        status: WidgetStatus.PENDING,
        userId: userId,
        widgetKey: widgetKey,
        code: widgetCode,
      };

      const created = await this.widgetRepository.create(widget, { session });
      this.logger.info('Created widget:', created);
      return created;
    });
  }

  async update(_id: string, widget: WidgetDto): Promise<WidgetDto | null> {
    const { status, userId, widgetKey, ...safeWidget } = widget;
    const updated = await this.widgetRepository.update(_id, safeWidget as Widget);
    if (!updated) {
      this.logger.error('Widget not found:', _id);
      throw new NotFoundError('Widget not found: ' + _id);
    }
    this.logger.info('Updated widget:', updated);
    return updated;
  }

  async findById(_id: string): Promise<WidgetDto | null> {
    const widget = await this.widgetRepository.findById(_id);
    if (!widget) {
      this.logger.error('Widget not found:', _id);
      throw new NotFoundError('Widget not found: ' + _id);
    }
    this.logger.info('Found widget:', widget);
    return widget;
  }

  async generate(widgetKey: string): Promise<string> {
    return 'widget ' + widgetKey;
  }

  private buildScriptSnippet(apiUrl: string, widgetKey: string): string {
    return `<script src="${apiUrl}/public/widgets?widgetKey=${widgetKey}"></script>`;
  }
}
