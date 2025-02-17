import { LoggerService } from '../../common';
import { UserRepository } from './user.repository';
import { UserDto, UserRole } from './user.types';

export class UserService {
  private logger = LoggerService.getLogger('feature.user.UserService');

  constructor(private readonly userRepository: UserRepository) {}

  async findById(id: string) {
    return this.userRepository.findById(id);
  }

  async register(user: UserDto) {
    this.logger.info('Register user:', user);
    return this.userRepository.create({ ...user, role: UserRole.USER });
  }

  async update(user: UserDto) {
    this.logger.info('Update user:', user);
    return this.userRepository.update(user);
  }
}
