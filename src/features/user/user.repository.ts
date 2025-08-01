import { BaseRepository } from '../base.repository';
import { User } from './user.types';
import { Collection } from 'mongodb';

export class UserRepository extends BaseRepository<User> {
  constructor(collection: Collection<User>) {
    super(collection);
  }

  async findByEmailAndPassword(email: string, password: string): Promise<User | null> {
    return this.collection.findOne({ email, password });
  }

  async findByUserId(userId: string): Promise<User | null> {
    return this.collection.findOne({ userId: userId });
  }
}
