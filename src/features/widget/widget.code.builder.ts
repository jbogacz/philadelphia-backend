import { DynamicBuilder } from '../../dynamic/builder';
import { WidgetCodeBlueprint, WidgetCodeConfig } from './widget.types';

export class WidgetCodeBuilder extends DynamicBuilder<WidgetCodeBlueprint, WidgetCodeConfig> {
  constructor() {
    super('widget', __dirname);
  }
}
