import { Type } from '@sinclair/typebox';
import { Collection, Filter, MongoError, ObjectId, WithId } from 'mongodb';
import { LoggerService } from '../common';

export const BaseSchema = Type.Object({
  _id: Type.Optional(Type.String()),
  createdAt: Type.Optional(Type.Date()),
  updatedAt: Type.Optional(Type.Date()),
});

export interface IEntity {
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class BaseRepository<T extends IEntity> {
  private logger = LoggerService.getLogger('feature.base.BaseRepository');

  constructor(protected collection: Collection<T>) {}

  async findByPrimaryId(_id: string): Promise<WithId<T> | null> {
    return this.collection.findOne({ _id: new ObjectId(_id) } as Filter<T>);
  }

  async save(data: T): Promise<T | null> {
    if (data._id) {
      return this.update(data._id, data);
    } else {
      return this.create(data);
    }
  }

  async create(data: T, options?: any): Promise<T> {
    const now = new Date();

    const upsert = await this.collection.findOneAndUpdate(
      { _id: new ObjectId() } as Filter<T>,
      { $setOnInsert: { ...data, createdAt: now, updatedAt: now } },
      {
        upsert: true,
        returnDocument: 'after',
        session: options?.session,
      }
    );

    if (!upsert) {
      this.logger.error('Failed to insert document:', data);
      throw new MongoError('Failed to insert document: ' + JSON.stringify(data));
    }

    return upsert as T;
  }

  async update(_id: string, data: T): Promise<T | null> {
    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(_id) } as Filter<T>,
      {
        $set: { ...data, _id: new ObjectId(_id), updatedAt: new Date() },
      },
      { returnDocument: 'after' }
    );
    return result && (result as T);
  }

  async query(query: Filter<T>, options?: any): Promise<WithId<T>[]> {
    return this.collection.find(query, { session: options?.session }).toArray();
  }
}
