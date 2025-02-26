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
    const user = await this.userRepository.findById(userId);
    if (!user) {
      this.logger.error('User not found:', userId);
      throw new NotFoundError('User not found: ' + userId);
    }

    const session = this.mongo.client.startSession();
    try {
      session.startTransaction();

      const existing = await this.widgetRepository.query(
        { userId: userId, status: WidgetStatus.PENDING, hookId: { $exists: false } },
        { session }
      );
      if (existing.length > 0) {
        this.logger.info('Return existing widget:', existing[0]);
        return { id: existing[0]._id, ...existing[0] };
      }

      const widget: Widget = {
        status: WidgetStatus.PENDING,
        userId: userId,
        code: `<script>${randomUUID().toString()}</script>`,
      };
      const created = await this.widgetRepository.create(widget, { session });
      await session.commitTransaction();

      this.logger.info('Created widget:', created);
      return { id: created._id, ...created };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async update(id: string, widget: WidgetDto): Promise<WidgetDto | null> {
    const updated = await this.widgetRepository.update(id, { hookId: widget.hookId } as Widget);
    if (!updated) {
      this.logger.error('Widget not found:', id);
      throw new NotFoundError('Widget not found: ' + id);
    }
    this.logger.info('Updated widget:', updated);
    return { id: updated._id, ...updated };
  }

  async findById(id: string): Promise<WidgetDto | null> {
    const widget = await this.widgetRepository.findByPrimaryId(id);
    if (!widget) {
      this.logger.error('Widget not found:', id);
      throw new NotFoundError('Widget not found: ' + id);
    }
    this.logger.info('Found widget:', widget);
    return { id: widget._id, ...widget };
  }
}
