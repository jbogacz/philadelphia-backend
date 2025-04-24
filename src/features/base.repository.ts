import { Type } from '@sinclair/typebox';
import { ClientSession, Collection, Filter, MongoClient, MongoError, ObjectId, WithId } from 'mongodb';
import { LoggerService } from '../common';
import { BadRequestError, NotFoundError } from '../common/errors';
import { is24Hex } from '../common/utils';

export const ObjectIdType = Type.Unsafe<ObjectId>({
  type: 'string',
  pattern: '^[0-9a-fA-F]{24}$',
  description: 'MongoDB ObjectId',
});

export const DateTimeType = Type.Unsafe<Date>({
  type: 'string',
  format: 'date-time',
  description: 'ISO 8601 date-time format',
});

export const BaseSchema = Type.Object({
  _id: Type.Optional(Type.String()),
  createdAt: Type.Optional(Type.Date()),
  updatedAt: Type.Optional(Type.Date()),
});

export const BaseSchemaV2 = Type.Object({
  _id: Type.Optional(ObjectIdType),
  createdAt: Type.Optional(DateTimeType),
  updatedAt: Type.Optional(DateTimeType),
});

export interface IEntity {
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IEntityV2 {
  _id?: ObjectId | string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const RangeSchema = Type.Object({
  min: Type.Number(),
  max: Type.Number(),
});

export class BaseRepository<T extends IEntity | IEntityV2> {
  private logger = LoggerService.getLogger('feature.base.BaseRepository');

  constructor(protected collection: Collection<T>) {}

  async findById(id: string | ObjectId, userId?: string): Promise<WithId<T> | null> {
    if (!(id instanceof ObjectId) && !is24Hex(id)) {
      this.logger.error('Invalid ID format:', id);
      throw new BadRequestError('Invalid ID format:' + id);
    }

    const _id = id instanceof ObjectId ? id : new ObjectId(id);
    const filter: Filter<any> = {
      _id: _id,
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

  async createV2(data: Partial<T>, options?: any): Promise<T> {
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

  async update<P extends Partial<T>>(id: any, data: P, options?: any): Promise<T | null> {
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

  async updateV2<P extends Partial<T>>(id: string | ObjectId, data: P, options?: any): Promise<T | null> {
    if (!(id instanceof ObjectId) && !is24Hex(id)) {
      this.logger.error('Invalid ID format:', id);
      throw new BadRequestError('Invalid ID format:' + id);
    }

    const _id = id instanceof ObjectId ? id : new ObjectId(id);
    const result = await this.collection.findOneAndUpdate(
      { _id: _id } as Filter<T>,
      {
        $set: { ...data, updatedAt: new Date() },
      },
      {
        returnDocument: 'after',
        session: options?.session,
      }
    );
    return result as T;
  }

  async updateWhere<P extends Partial<T>>(query: any, data: P, options?: any): Promise<T | null> {
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

  async updateWhereV2<F extends Filter<T>, P extends Partial<T>>(query: F, data: P, options?: any): Promise<T | null> {
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

  async query(query: any, options?: any): Promise<WithId<T>[]> {
    return this.collection.find(query, { session: options?.session }).toArray();
  }

  async queryV2<P extends Filter<T>>(query: P, options?: any): Promise<WithId<T>[]> {
    return this.collection.find(query, { session: options?.session }).toArray();
  }

  async queryOne(query: any, options?: any): Promise<WithId<T> | null> {
    return this.collection.findOne(query, { session: options?.session });
  }

  async aggregate<R = T>(pipeline: any[], options?: any): Promise<R[]> {
    const result = await this.collection.aggregate(pipeline, { session: options?.session }).toArray();
    return result as R[];
  }

  async aggregateOne<R = T>(pipeline: any[], options?: any): Promise<R | null> {
    const results = await this.aggregate<R>(pipeline, options);
    return results.length > 0 ? results[0] : null;
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
