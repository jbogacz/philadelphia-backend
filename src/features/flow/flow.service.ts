import { FlowBuilder } from './flow.builder';
import { FlowDto } from './flow.types';

export class FlowService {
  private flowBuilder: FlowBuilder = new FlowBuilder();

  async generate(flow: FlowDto) {
    const { utmCampaign, utmSource, utmContent } = flow;
    return this.flowBuilder.build({}, { name: 'flow' });
  }
}
