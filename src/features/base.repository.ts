import { Type } from '@sinclair/typebox';
import { ClientSession, Collection, Filter, MongoClient, MongoError, ObjectId, WithId } from 'mongodb';
import { LoggerService } from '../common';
import { NotFoundError } from '../common/errors';
import { is24Hex } from '../common/utils';

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

export const RangeSchema = Type.Object({
  min: Type.Number(),
  max: Type.Number(),
});

export class BaseRepository<T extends IEntity> {
  private logger = LoggerService.getLogger('feature.base.BaseRepository');

  constructor(protected collection: Collection<T>) {}

  async findByPrimaryId(id: any, userId?: string): Promise<WithId<T> | null> {
    if (!is24Hex(id)) {
      this.logger.error('Invalid ID format:', id);
      throw new NotFoundError('Record not found: ' + id);
    }
    
    const filter: Filter<any> = {
      _id: id instanceof ObjectId ? id : ObjectId.createFromHexString(id),
    };

    // Restrict access to the document if userId is provided
    if (userId !== undefined) {
      filter.userId = userId;
    }

    return this.collection.findOne(filter);
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

  async update(id: any, data: T, options?: any): Promise<T | null> {
    if (!is24Hex(id)) {
      this.logger.error('Invalid ID format:', id);
      throw new NotFoundError('Record not found: ' + id);
    }

    const result = await this.collection.findOneAndUpdate(
      { _id: id instanceof ObjectId ? id : ObjectId.createFromHexString(id) } as Filter<T>,
      {
        $set: { ...data, updatedAt: new Date() },
      },
      {
        returnDocument: 'after',
        session: options?.session,
      }
    );
    return result && (result as T);
  }

  async updateWhere(query: Filter<T>, data: T, options?: any): Promise<T | null> {
    const result = await this.collection.findOneAndUpdate(
      query,
      {
        $set: { ...data, updatedAt: new Date() },
      },
      {
        returnDocument: 'after',
        session: options?.session,
      }
    );
    return result && (result as T);
  }

  async delete(id: any): Promise<T | null> {
    if (!is24Hex(id)) {
      this.logger.error('Invalid ID format:', id);
      throw new NotFoundError('Record not found: ' + id);
    }

    const result = await this.collection.findOneAndDelete({
      _id: id instanceof ObjectId ? id : ObjectId.createFromHexString(id),
    } as Filter<T>);
    return result && (result as T);
  }

  async query(query: Filter<T>, options?: any): Promise<WithId<T>[]> {
    return this.collection.find(query, { session: options?.session }).toArray();
  }

  async queryOne(query: Filter<T>, options?: any): Promise<WithId<T> | null> {
    return this.collection.findOne(query, { session: options?.session });
  }

  async aggregate(pipeline: any[], options?: any): Promise<T[]> {
    const result = await this.collection.aggregate(pipeline, { session: options?.session }).toArray();
    return result as T[];
  }
}

/**
 * Higher order function to wrap a function with a transaction.
 * Call it directly with the dbClient to get the function and do not assign it to a variable.
 *
 * @param dbClient
 * @returns
 */
const withTransaction =
  (dbClient: MongoClient) =>
  async <T>(fn: (session: ClientSession) => Promise<T>): Promise<T> => {
    const session = dbClient.startSession();
    try {
      session.startTransaction();
      const result = await fn(session);
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  };

export let txTemplate = {
  withTransaction,
};
