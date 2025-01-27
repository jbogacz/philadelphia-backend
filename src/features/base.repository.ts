import { Type } from '@sinclair/typebox';
import { Collection, Filter, OptionalUnlessRequiredId, WithId } from 'mongodb';

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
  constructor(protected collection: Collection<T>) {}

  async findById(id: string): Promise<WithId<T> | null> {
    return this.collection.findOne({ _id: id } as Filter<T>);
  }

  async save(data: T): Promise<T> {
    if (data._id) {
      return this.update(data);
    } else {
      return this.create(data);
    }
  }

  async create(data: T): Promise<T> {
    const now = new Date();
    const result = await this.collection.insertOne({ ...data, createdAt: now, updatedAt: now } as OptionalUnlessRequiredId<T>);

    if (!result.acknowledged) {
      throw new Error('Failed to insert document');
    }

    return {
      _id: result.insertedId,
      ...data
    } as T;
  }

  async update(data: T): Promise<T> {
    const result = await this.collection.updateOne({ _id: data._id } as Filter<T>, { $set: { ...data, updatedAt: new Date() } });
    if (!result.acknowledged) {
      throw new Error('Failed to update document._id: ' + data._id);
    }
    return data;
  }
}
