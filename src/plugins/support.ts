import fp from 'fastify-plugin';
import type { Db } from 'mongodb';
import { AppOptions } from '../app.types';
import { FlowController } from '../features/flow/flow.controller';
import { FlowService } from '../features/flow/flow.service';
import { HookController } from '../features/hook/hook.controller';
import { HookRepository } from '../features/hook/hook.repository';
import { HookService } from '../features/hook/hook.service';
import { CampaignInsightService } from '../features/insight/campaign.insight.service';
import { InsightController } from '../features/insight/insight.controller';
import { InsightService } from '../features/insight/insight.service';
import { CampaignController } from '../features/marketplace/campaign/campaign.controller';
import { CampaignRepository } from '../features/marketplace/campaign/campaign.repository';
import { CampaignService } from '../features/marketplace/campaign/campaign.service';
import { DemandController } from '../features/marketplace/demand/demand.controller';
import { DemandRepository } from '../features/marketplace/demand/demand.repository';
import { DemandService } from '../features/marketplace/demand/demand.service';
import { OfferController } from '../features/marketplace/offer/offer.controller';
import { OfferRepository } from '../features/marketplace/offer/offer.repository';
import { OfferService } from '../features/marketplace/offer/offer.service';
import { PartnerController } from '../features/partner/partner.controller';
import { PartnerService } from '../features/partner/partner.service';
import { PartnershipRepository } from '../features/partnership/partnership.repository';
import { PublisherRepository } from '../features/publisher/publisher.repository';
import { PublisherService } from '../features/publisher/publisher.service';
import { TraceController } from '../features/trace/trace.controller';
import { TraceRepository } from '../features/trace/trace.repository';
import { TraceService } from '../features/trace/trace.service';
import { UserController } from '../features/user/user.controller';
import { UserRepository } from '../features/user/user.repository';
import { UserService } from '../features/user/user.service';
import { WidgetComponentService } from '../features/widget/widget.component.service';
import { WidgetController } from '../features/widget/widget.controller';
import { WidgetRepository } from '../features/widget/widget.repository';
import { WidgetService } from '../features/widget/widget.service';
import { ConversationService } from '../features/conversation/conversation.service';
import { ConversationRepository } from '../features/conversation/conversation.repository';

export default fp<AppOptions>(async (fastify, opts) => {
  const { config } = opts;
  const db: Db = fastify.mongo.db!;

  fastify.decorate('repository', {
    trace: new TraceRepository(db.collection('traces')),
    publisher: new PublisherRepository(db.collection('publishers')),
    user: new UserRepository(db.collection('users')),
    hook: new HookRepository(db.collection('hooks')),
    widget: new WidgetRepository(db.collection('widgets')),
    partnership: new PartnershipRepository(db.collection('partnerships')),
    demand: new DemandRepository(db.collection('demands')),
    offer: new OfferRepository(db.collection('offers')),
    campaign: new CampaignRepository(db.collection('campaigns')),
    conversation: new ConversationRepository(db.collection('conversations')),
  });

  const publisherService = new PublisherService(fastify.repository.publisher);
  const widgetCodeService = new WidgetComponentService(fastify.repository.widget, fastify.repository.partnership, config);
  const campaignService = new CampaignService(
    fastify.repository.campaign,
    fastify.repository.demand,
    fastify.repository.hook,
    fastify.repository.user,
    config
  );

  fastify.decorate('service', {
    trace: new TraceService(fastify.repository.trace, fastify.repository.widget, fastify.repository.hook, fastify.repository.campaign),
    publisher: publisherService,
    flow: new FlowService(fastify.repository.campaign, fastify.repository.widget, config),
    user: new UserService(fastify.repository.user),
    hook: new HookService(fastify.mongo, fastify.repository.hook, fastify.repository.user, fastify.repository.widget),
    widget: new WidgetService(fastify.mongo, config, fastify.repository.widget, fastify.repository.user),
    insight: new InsightService(fastify.mongo),
    campaignInsight: new CampaignInsightService(fastify.repository.campaign, fastify.repository.trace),
    partner: new PartnerService(fastify.repository.hook, fastify.repository.widget),
    demand: new DemandService(fastify.repository.demand),
    campaign: campaignService,
    offer: new OfferService(campaignService, fastify.repository.offer, fastify.repository.demand),
    conversation: new ConversationService(fastify.repository.conversation, fastify.repository.campaign, fastify.mongo),
  });

  fastify.decorate('controller', {
    trace: new TraceController(fastify.service.trace),
    flow: new FlowController(fastify.service.flow),
    user: new UserController(fastify.service.user),
    hook: new HookController(fastify.service.hook, config),
    widget: new WidgetController(fastify.service.widget, widgetCodeService, config),
    insight: new InsightController(fastify.service.insight, fastify.service.campaignInsight),
    partner: new PartnerController(fastify.service.partner),
    demand: new DemandController(fastify.service.demand, config),
    offer: new OfferController(fastify.service.offer, config),
    campaign: new CampaignController(fastify.service.campaign, fastify.service.conversation, config),
  });
});

declare module 'fastify' {
  export interface FastifyInstance {
    repository: {
      trace: TraceRepository;
      publisher: PublisherRepository;
      user: UserRepository;
      hook: HookRepository;
      widget: WidgetRepository;
      partnership: PartnershipRepository;
      demand: DemandRepository;
      offer: OfferRepository;
      campaign: CampaignRepository;
      conversation: ConversationRepository;
    };
    service: {
      trace: TraceService;
      publisher: PublisherService;
      flow: FlowService;
      user: UserService;
      hook: HookService;
      widget: WidgetService;
      insight: InsightService;
      campaignInsight: CampaignInsightService;
      partner: PartnerService;
      demand: DemandService;
      offer: OfferService;
      campaign: CampaignService;
      conversation: ConversationService;
    };
    controller: {
      trace: TraceController;
      flow: FlowController;
      user: UserController;
      hook: HookController;
      widget: WidgetController;
      insight: InsightController;
      partner: PartnerController;
      demand: DemandController;
      offer: OfferController;
      campaign: CampaignController;
    };
    cacheManager: any;
  }
}
