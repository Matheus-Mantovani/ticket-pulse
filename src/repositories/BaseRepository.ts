import { Model, Query, FilterQuery, UpdateQuery, ClientSession } from "mongoose";

export abstract class BaseRepository<T> {
  constructor(protected readonly model: Model<T>) {}

  findById(id: string, session?: ClientSession): Query<T | null, T> {
    const query = this.model.findById(id);
    if (session) {
      query.session(session);
    }
    return query;
  }

  findOne(filter: FilterQuery<T>, session?: ClientSession): Query<T | null, T> {
    const query = this.model.findOne(filter);
    if (session) {
      query.session(session);
    }
    return query;
  }

  find(filter: FilterQuery<T> = {}, session?: ClientSession): Query<T[], T> {
    const query = this.model.find(filter);
    if (session) {
      query.session(session);
    }
    return query;
  }

  createOne(data: Partial<T>, session?: ClientSession): Promise<T> {
    if (session) {
      return this.model.create([data], { session }).then((docs) => docs[0]);
    }
    return this.model.create(data);
  }

  updateById(
    id: string,
    update: UpdateQuery<T>,
    session?: ClientSession
  ): Query<T | null, T> {
    const query = this.model.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });
    if (session) {
      query.session(session);
    }
    return query;
  }

  deleteById(id: string, session?: ClientSession): Query<T | null, T> {
    const query = this.model.findByIdAndDelete(id);
    if (session) {
      query.session(session);
    }
    return query;
  }

  countDocuments(
    filter: FilterQuery<T> = {},
    session?: ClientSession
  ): Query<number, T> {
    const query = this.model.countDocuments(filter);
    if (session) {
      query.session(session);
    }
    return query;
  }
}
