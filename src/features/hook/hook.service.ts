import { FastifyMongoObject, ObjectId } from '@fastify/mongodb';
import { LoggerService } from '../../common';
import { NotFoundError } from '../../common/errors';
import { UserRepository } from '../user/user.repository';
import { WidgetRepository } from '../widget/widget.repository';
import { Widget, WidgetStatus } from '../widget/widget.types';
import { HookRepository } from './hook.repository';
import { Hook, HookDto, HookQueryDto, HookStatus, HookUpdateDto } from './hook.types';

export class HookService {
  private logger = LoggerService.getLogger('feature.hook.HookService');

  constructor(
    private readonly mongo: FastifyMongoObject,
    private readonly hookRepository: HookRepository,
    private readonly userRepository: UserRepository,
    private readonly widgetRepository: WidgetRepository
  ) {}

  async findById(id: string): Promise<HookDto | null> {
    const hook = await this.hookRepository.findById(id);
    return (
      hook && {
        ...hook,
        createdAt: hook.createdAt?.toISOString(),
        updatedAt: hook.updatedAt?.toISOString(),
      }
    );
  }

  async query(query: HookQueryDto): Promise<HookDto[]> {
    const hooks = await this.hookRepository.query(query);
    return hooks.map((hook) => ({
      ...hook,
      createdAt: hook.createdAt?.toISOString(),
      updatedAt: hook.updatedAt?.toISOString(),
    }));
  }

  async create(hook: HookDto): Promise<HookDto> {
    this.logger.info('Creating hook:', hook);
    const user = await this.userRepository.findByUserId(hook.userId);
    if (!user) {
      this.logger.error('User not found:', hook.userId);
      throw new NotFoundError('User not found: ' + hook.userId);
    }

    const created = await this.hookRepository.create({
      ...hook,
      widgetId: new ObjectId(hook.widgetId), // Convert string to ObjectId
      status: HookStatus.REGISTERED,
    } as any);
    this.logger.info('Created hook:', created);

    await this.widgetRepository.update(created.widgetId, { hookId: created._id, status: WidgetStatus.REGISTERED } as Widget);

    return {
      ...created,
      createdAt: created.createdAt?.toISOString(),
      updatedAt: created.updatedAt?.toISOString(),
    };
  }

  async update(_id: string, hook: HookUpdateDto): Promise<HookUpdateDto | null> {
    // Update of userId is not allowed
    const { userId, ...toUpdate } = { ...hook };

    const updated = await this.hookRepository.update(_id, toUpdate as Hook);
    if (!updated) {
      this.logger.error('Hook not found:', _id);
      throw new NotFoundError('Hook not found: ' + _id);
    }

    this.logger.info('Updated hook:', updated);
    return {
      ...updated,
      createdAt: updated.createdAt?.toISOString(),
      updatedAt: updated.updatedAt?.toISOString(),
    };
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.hookRepository.delete(id);
    if (!deleted) {
      this.logger.error('Hook not found:', id);
      throw new NotFoundError('Hook not found: ' + id);
    }
    this.logger.info('Deleted hook:', deleted);

    await this.widgetRepository.update(deleted.widgetId, { status: WidgetStatus.DELETED } as Widget);
  }
}
