import { LoggerService } from '../../common';
import { UserRepository } from './user.repository';
import { UserDto, UserRole } from './user.types';

export class UserService {
  private logger = LoggerService.getLogger('feature.user.UserService');

  constructor(private readonly userRepository: UserRepository) {}

  async findByUserId(userId: string): Promise<UserDto | null> {
    return this.userRepository.findByUserId(userId);
  }

  async register(user: UserDto): Promise<UserDto> {
    this.logger.info('Register user:', user);
    return this.userRepository.create({ ...user, role: UserRole.USER });
  }

  async update(_id: string, user: UserDto): Promise<UserDto | null> {
    this.logger.info('Update user:', user);
    return this.userRepository.update(_id, { ...user, role: UserRole.USER });
  }
}
