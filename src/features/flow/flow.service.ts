import { AppConfig } from '../../app.types';
import { LoggerService } from '../../common';
import { CampaignTrace } from '../campaign/campaign.types';
import { CampaignRepository } from '../marketplace/campaign/campaign.repository';
import { CampaignStatus } from '../marketplace/marketplace.types';
import { WidgetRepository } from '../widget/widget.repository';
import { FlowBuilder } from './flow.builder';
import { FlowBlueprint, FlowConfig, FlowDto, FlowEventDto } from './flow.types';

export class FlowService {
  private logger = LoggerService.getLogger('feature.flow.FlowService');

  private flowBuilder: FlowBuilder = new FlowBuilder();

  constructor(
    private readonly campaignRepository: CampaignRepository,
    private readonly widgetRepository: WidgetRepository,
    private readonly config: AppConfig
  ) {}

  async generateCode(flow: FlowDto) {
    const { utm_campaign: utmCampaign } = flow;

    const campaign = await this.campaignRepository.queryOne({
      utmCampaign: utmCampaign,
    });

    if (!campaign) {
      this.logger.error(`Campaign not found for utm_campaign: ${utmCampaign}`);
      throw new Error(`Campaign not found for utm_campaign: ${utmCampaign}`);
    }
    if (campaign.status !== CampaignStatus.ACTIVE) {
      this.logger.error(`Campaign ${campaign._id} is not active: ${campaign.status}`);
      throw new Error(`Campaign is not active: ${campaign.status}`);
    }

    const widget = await this.widgetRepository.queryOne({
      hookId: campaign.hookId,
    });
    if (!widget) {
      this.logger.error(`Widget not found for hookId: ${campaign.hookId}`);
      throw new Error(`Widget not found for hookId: ${campaign.hookId}`);
    }

    const landingPage = !/^https?:\/\//i.test(campaign.destinationUrl) ? `https://${campaign.destinationUrl}` : campaign.destinationUrl;

    const flowBlueprint: FlowBlueprint = {
      utmCampaign: campaign.utmCampaign,
      landingPage: landingPage,
      widgetKey: widget.widgetKey,
    };

    const flowConfig: FlowConfig = {
      apiUrl: this.config.apiUrl,
    };

    return this.flowBuilder.build(flowBlueprint, flowConfig);
  }

  async captureEvent(event: FlowEventDto): Promise<void> {
    this.logger.info('Capturing flow event:', event);
    const trace: CampaignTrace = {
      traceId: event.traceId,
      fingerprint: event.fingerprint,
      publisherId: event.publisherId,
      created: new Date(),
    };
    // await this.campaignService.appendTrace(event.campaignId, trace);
  }
}
