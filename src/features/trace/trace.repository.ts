import { Collection } from 'mongodb';
import { Profile } from './trace.types';
import { BaseRepository } from '../base.repository';

export class ProfileRepository2 extends BaseRepository<Profile> {
  constructor(collection: Collection<Profile>) {
    super(collection);
  }

  async findByFingerprintId(fingerprintId: string): Promise<Profile | null> {
    return await this.collection.findOne({
      'fingerprints.fingerprintId': fingerprintId
    });
  }

  async findByEmail(email: string): Promise<Profile | null> {
    return await this.collection.findOne({ 'emails.value': email });
  }
}
