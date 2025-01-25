import { DynamicBuilder } from '../../../dynamic/builder';
import { FlowBlueprint, FlowConfig } from './flow.types';

export class FlowBuilder extends DynamicBuilder<FlowBlueprint, FlowConfig> {
  constructor() {
    super(__dirname);
  }
}
