import { randomUUID } from 'crypto';
import { AuthorizationError, AuthRequest, AuthResponse } from './auth.types';
import { UserRepository } from './user.repository';

export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async login(auth: AuthRequest): Promise<AuthResponse> {
    const user = await this.userRepository.findByEmailAndPassword(auth.email, auth.password);
    if (!user) {
      throw new AuthorizationError();
    }
    return {
      token: randomUUID(),
      user: {
        email: user.email,
        role: user.role,
      },
    };
  }
}
