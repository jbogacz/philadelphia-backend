import fp from 'fastify-plugin';
import type { Db } from 'mongodb';
import { AppOptions } from '../app.types';
import { CampaignRepository } from '../features/campaign/campaign.repository';
import { CampaignService } from '../features/campaign/campaign.service';
import { FlowController } from '../features/flow/flow.controller';
import { FlowService } from '../features/flow/flow.service';
import { HookController } from '../features/hook/hook.controller';
import { HookRepository } from '../features/hook/hook.repository';
import { HookService } from '../features/hook/hook.service';
import { ListingController } from '../features/listing/listing.controller';
import { PublisherRepository } from '../features/publisher/publisher.repository';
import { PublisherService } from '../features/publisher/publisher.service';
import { TraceController } from '../features/trace/trace.controller';
import { TraceRepository } from '../features/trace/trace.repository';
import { TraceService } from '../features/trace/trace.service';
import { UserController } from '../features/user/user.controller';
import { UserRepository } from '../features/user/user.repository';
import { UserService } from '../features/user/user.service';
import { WidgetCodeService } from '../features/widget/widget.code.service';
import { WidgetController } from '../features/widget/widget.controller';
import { WidgetRepository } from '../features/widget/widget.repository';
import { WidgetService } from '../features/widget/widget.service';
import { PartnershipRepository } from '../features/partnership/partnership.repository';

export default fp<AppOptions>(async (fastify, opts) => {
  const { config } = opts;
  const db: Db = fastify.mongo.db!;

  fastify.decorate('repository', {
    trace: new TraceRepository(db.collection('traces')),
    publisher: new PublisherRepository(db.collection('publishers')),
    campaign: new CampaignRepository(db.collection('campaigns')),
    user: new UserRepository(db.collection('users')),
    hook: new HookRepository(db.collection('hooks')),
    widget: new WidgetRepository(db.collection('widgets')),
    partnership: new PartnershipRepository(db.collection('partnerships')),
  });

  const publisherService = new PublisherService(fastify.repository.publisher);
  const campaignService = new CampaignService(fastify.repository.campaign);
  const widgetCodeService = new WidgetCodeService(fastify.repository.widget, fastify.repository.partnership, config);

  fastify.decorate('service', {
    trace: new TraceService(fastify.repository.trace, fastify.repository.widget, fastify.repository.hook),
    publisher: publisherService,
    campaign: campaignService,
    flow: new FlowService(publisherService, campaignService, config),
    user: new UserService(fastify.repository.user),
    hook: new HookService(fastify.mongo, fastify.repository.hook, fastify.repository.user, fastify.repository.widget),
    widget: new WidgetService(fastify.mongo, config, fastify.repository.widget, fastify.repository.user),
  });

  fastify.decorate('controller', {
    trace: new TraceController(fastify.service.trace),
    flow: new FlowController(fastify.service.flow),
    user: new UserController(fastify.service.user),
    listing: new ListingController(),
    hook: new HookController(fastify.service.hook, config),
    widget: new WidgetController(fastify.service.widget, widgetCodeService, config),
  });
});

declare module 'fastify' {
  export interface FastifyInstance {
    repository: {
      trace: TraceRepository;
      publisher: PublisherRepository;
      campaign: CampaignRepository;
      user: UserRepository;
      hook: HookRepository;
      widget: WidgetRepository;
      partnership: PartnershipRepository;
    };
    service: {
      trace: TraceService;
      flow: FlowService;
      user: UserService;
      hook: HookService;
      widget: WidgetService;
    };
    controller: {
      trace: TraceController;
      flow: FlowController;
      user: UserController;
      listing: ListingController;
      hook: HookController;
      widget: WidgetController;
    };
  }
}
