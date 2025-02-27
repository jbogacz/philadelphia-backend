import { randomUUID } from 'crypto';
import { LoggerService } from '../../common';
import { NotFoundError } from '../../common/errors';
import { UserRepository } from '../user/user.repository';
import { WidgetRepository } from './widget.repository';
import { Widget, WidgetDto, WidgetStatus } from './widget.types';
import { FastifyMongoObject } from '@fastify/mongodb';

export class WidgetService {
  private logger = LoggerService.getLogger('feature.widget.WidgetService');

  constructor(
    private readonly mongo: FastifyMongoObject,
    private readonly widgetRepository: WidgetRepository,
    private readonly userRepository: UserRepository
  ) {}

  async register(userId: string): Promise<WidgetDto> {
    const user = await this.userRepository.findByUserId(userId);
    if (!user) {
      this.logger.error('User not found:', userId);
      throw new NotFoundError('User not found: ' + userId);
    }

    const session = this.mongo.client.startSession();
    try {
      session.startTransaction();

      const existing = await this.widgetRepository.query(
        { userId: userId, status: WidgetStatus.PENDING, hookId: { $exists: false } },
        {  }
      );
      if (existing.length > 0) {
        this.logger.info('Return existing widget:', existing[0]);
        return existing[0];
      }

      const widget: Widget = {
        status: WidgetStatus.PENDING,
        userId: userId,
        widgetKey: randomUUID().toString(),
        code: `<script>${randomUUID().toString()}</script>`,
      };
      const created = await this.widgetRepository.create(widget, {  });
      await session.commitTransaction();

      this.logger.info('Created widget:', created);
      return created;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async update(_id: string, widget: WidgetDto): Promise<WidgetDto | null> {
    const updated = await this.widgetRepository.update(_id, { hookId: widget.hookId } as Widget);
    if (!updated) {
      this.logger.error('Widget not found:', _id);
      throw new NotFoundError('Widget not found: ' + _id);
    }
    this.logger.info('Updated widget:', updated);
    return updated;
  }

  async findById(_id: string): Promise<WidgetDto | null> {
    const widget = await this.widgetRepository.findByPrimaryId(_id);
    if (!widget) {
      this.logger.error('Widget not found:', _id);
      throw new NotFoundError('Widget not found: ' + _id);
    }
    this.logger.info('Found widget:', widget);
    return widget;
  }
}
