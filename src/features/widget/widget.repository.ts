import { BaseRepository } from '../base.repository';
import { Collection } from 'mongodb';
import { Widget } from './widget.types';

export class WidgetRepository extends BaseRepository<Widget> {
  constructor(collection: Collection<Widget>) {
    super(collection);
  }

  async findByWidgetKey(widgetKey: string): Promise<Widget | null> {
    return this.collection.findOne({
      widgetKey: widgetKey,
    });
  }

  async findByHookId(hookId: string): Promise<Widget | null> {
    return this.collection.findOne({
      hookId: hookId,
    });
  }
}
