import { LoggerService } from '../../common';
import { NotFoundError } from '../../common/errors';
import { UserRepository } from '../user/user.repository';
import { WidgetRepository } from './widget.repository';
import { Widget, WidgetDto, WidgetStatus } from './widget.types';

export class WidgetService {
  private logger = LoggerService.getLogger('feature.widget.WidgetService');

  constructor(private readonly widgetRepository: WidgetRepository, private readonly userRepository: UserRepository) {}

  async register(userId: string): Promise<WidgetDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      this.logger.error('User not found:', userId);
      throw new NotFoundError('User not found: ' + userId);
    }

    const existing = await this.widgetRepository.query({ userId: userId, status: WidgetStatus.PENDING });
    if (existing.length > 0) {
      this.logger.info('Return existing widget:', existing[0]);
      return { id: existing[0]._id, ...existing[0] };
    }

    const widget: Widget = {
      status: WidgetStatus.PENDING,
      userId: userId,
      code: 'widget-code',
    };
    const created = await this.widgetRepository.create(widget);
    this.logger.info('Created widget:', created);
    return { id: created._id, ...created };
  }
}
