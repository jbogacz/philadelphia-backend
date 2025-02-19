import { LoggerService } from '../../common';
import { NotFoundError } from '../../common/errors';
import { UserRepository } from '../user/user.repository';
import { HookRepository } from './hook.repository';
import { Hook, HookDto, HookQueryDto, HookStatus } from './hook.types';

export class HookService {
  private logger = LoggerService.getLogger('feature.hook.HookService');

  constructor(private readonly hookRepository: HookRepository, private readonly userRepository: UserRepository) {}

  async findById(id: string): Promise<HookDto | null> {
    const hook = await this.hookRepository.findByPrimaryId(id);
    return hook && { ...hook, id: hook._id };
  }

  async query(query: HookQueryDto): Promise<HookDto[]> {
    const hooks = await this.hookRepository.query(query);
    return hooks.map((hook) => ({ id: hook._id, ...hook }));
  }

  async create(hook: HookDto): Promise<HookDto> {
    const user = await this.userRepository.findById(hook.userId);
    if (!user) {
      this.logger.error('User not found:', hook.userId);
      throw new NotFoundError('User not found: ' + hook.userId);
    }

    const created = await this.hookRepository.create({ ...hook, status: HookStatus.ACTIVE });
    this.logger.info('Created hook:', created);
    return { id: created._id, ...created };
  }

  async update(hook: HookDto): Promise<HookDto | null> {
    // Update of userId is not allowed
    const { userId, ...toUpdate } = { _id: hook.id, ...hook };
    const updated = await this.hookRepository.update(toUpdate as Hook);
    if (!updated) {
      this.logger.error('Hook not found:', hook.id);
      throw new NotFoundError('Hook not found: ' + hook.id);
    }
    this.logger.info('Updated hook:', updated);
    return { id: updated._id, ...updated };
  }
}
