import { BaseRepository } from '../base.repository';
import { User } from './auth.types';
import { Collection } from 'mongodb';

export class UserRepository extends BaseRepository<User> {
  constructor(collection: Collection<User>) {
    super(collection);
  }

  async findByEmailAndPassword(email: string, password: string): Promise<User | null> {
    return this.collection.findOne({ email, password });
  }

  async findById(id: string): Promise<User | null> {
    return this.collection.findOne({ id: id });
  }
}
