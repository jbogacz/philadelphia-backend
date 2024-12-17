import { Collection, Filter, ObjectId, OptionalUnlessRequiredId, WithId } from 'mongodb';

export interface IEntity {
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class BaseRepository<T extends IEntity> {
  constructor(protected collection: Collection<T>) {}

  async findById(id: ObjectId): Promise<WithId<T> | null> {
    return this.collection.findOne({ _id: id } as Filter<T>);
  }

  async save(data: T): Promise<T> {
    if (data._id) {
      return this.update(data);
    } else {
      return this.create(data);
    }
  }

  private async create(data: T): Promise<T> {
    const now = new Date();
    const result = await this.collection.insertOne({ ...data, createdAt: now, updatedAt: now } as OptionalUnlessRequiredId<T>);

    if (!result.acknowledged) {
      throw new Error('Failed to insert document');
    }
    return data as T;
  }

  private async update(data: T): Promise<T> {
    const result = await this.collection.updateOne({ _id: data._id } as Filter<T>, { $set: { ...data, updatedAt: new Date() } });
    if (!result.acknowledged) {
      throw new Error('Failed to update document._id: ' + data._id);
    }
    return data;
  }
}
