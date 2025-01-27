import { AppConfig } from '../../app.types';
import { CampaignService } from '../campaign/campaign.service';
import { PublisherService } from '../publisher/publisher.service';
import { FlowBuilder } from './flow.builder';
import { FlowBlueprint, FlowConfig, FlowDto, valueOfSource } from './flow.types';

export class FlowService {
  private flowBuilder: FlowBuilder = new FlowBuilder();

  constructor(
    private readonly publisherService: PublisherService,
    private readonly campaignService: CampaignService,
    private readonly config: AppConfig,
  ) {}

  async generateCode(flow: FlowDto) {
    const { utmCampaign, utmSource, utmContent } = flow;

    const campaign = await this.campaignService.findById(utmCampaign);
    const publisher = await this.publisherService.findById(utmContent);

    const flowBlueprint: FlowBlueprint = {
      campaignId: campaign.campaignId,
      publisherId: publisher.publisherId,
      source: valueOfSource(utmSource),
    };

    const flowConfig: FlowConfig = {
      traceApiUrl: this.config.trace.apiUrl,
      flowApiUrl: this.config.flow.apiUrl,
    };

    return this.flowBuilder.build(flowBlueprint, flowConfig);
  }
}
