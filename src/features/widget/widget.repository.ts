import { BaseRepository } from '../base.repository';
import { Collection } from 'mongodb';
import { Widget } from './widget.types';

export class WidgetRepository extends BaseRepository<Widget> {
  constructor(collection: Collection<Widget>) {
    super(collection);
  }
}
