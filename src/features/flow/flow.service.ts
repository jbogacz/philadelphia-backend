import { AppConfig } from '../../app.types';
import { CampaignService } from '../campaign/campaign.service';
import { CampaignTrace } from '../campaign/campaign.types';
import { PublisherService } from '../publisher/publisher.service';
import { FlowBuilder } from './flow.builder';
import { FlowBlueprint, FlowConfig, FlowDto, FlowEventDto, valueOfSource } from './flow.types';

export class FlowService {
  private flowBuilder: FlowBuilder = new FlowBuilder();

  constructor(
    private readonly publisherService: PublisherService,
    private readonly campaignService: CampaignService,
    private readonly config: AppConfig,
  ) {}

  async generateCode(flow: FlowDto) {
    const { utm_campaign: campaignId, utm_content: publishedId, utm_source: source } = flow;
    
    const campaign = await this.campaignService.findById(campaignId);
    const publisher = await this.publisherService.findById(publishedId);

    const flowBlueprint: FlowBlueprint = {
      campaignId: campaign.campaignId,
      publisherId: publisher.publisherId,
      source: valueOfSource(source),
    };

    const flowConfig: FlowConfig = {
      traceApiUrl: this.config.trace.apiUrl,
      flowApiUrl: this.config.flow.apiUrl,
    };

    return this.flowBuilder.build(flowBlueprint, flowConfig);
  }

  async captureEvent(event: FlowEventDto): Promise<void> {
    console.log('Capturing flow event:', event);
    const trace: CampaignTrace = {
      traceId: event.traceId,
      fingerprint: event.fingerprint,
      publisherId: event.publisherId,
      created: new Date(),
    };
    await this.campaignService.appendTrace(event.campaignId, trace);
  }
}
