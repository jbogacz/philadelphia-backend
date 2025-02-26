import fp from 'fastify-plugin';
import type { Db } from 'mongodb';
import { AppConfig, AppOptions } from '../app.types';
import { AdController } from '../features/ad/ad.controller';
import { AdMarkupService } from '../features/ad/ad.markup.service';
import { CreativeService } from '../features/ad/creative.service';
import { ImpressionController } from '../features/ad/impression.controller';
import { ImpressionRepository } from '../features/ad/impression.repository';
import { ImpressionService } from '../features/ad/impression.service';
import { UserController } from '../features/user/user.controller';
import { UserRepository } from '../features/user/user.repository';
import { UserService } from '../features/user/user.service';
import { CampaignRepository } from '../features/campaign/campaign.repository';
import { CampaignService } from '../features/campaign/campaign.service';
import { FlowController } from '../features/flow/flow.controller';
import { FlowService } from '../features/flow/flow.service';
import { ListingController } from '../features/listing/listing.controller';
import { PublisherRepository } from '../features/publisher/publisher.repository';
import { PublisherService } from '../features/publisher/publisher.service';
import { ProfileRepository } from '../features/trace/profile.repository';
import { TraceController } from '../features/trace/trace.controller';
import { TraceRepository } from '../features/trace/trace.repository';
import { TraceService } from '../features/trace/trace.service';
import { HookController } from '../features/hook/hook.controller';
import { HookService } from '../features/hook/hook.service';
import { HookRepository } from '../features/hook/hook.repository';
import { WidgetRepository } from '../features/widget/widget.repository';
import { WidgetService } from '../features/widget/widget.service';
import { WidgetController } from '../features/widget/widget.controller';

export default fp<AppOptions>(async (fastify, opts) => {
  const { config } = opts;
  const db: Db = fastify.mongo.db!;

  fastify.decorate('repository', {
    profile: new ProfileRepository(db.collection('profiles')),
    trace: new TraceRepository(db.collection('traces')),
    impression: new ImpressionRepository(db.collection('impressions')),
    publisher: new PublisherRepository(db.collection('publishers')),
    campaign: new CampaignRepository(db.collection('campaigns')),
    user: new UserRepository(db.collection('users')),
    hook: new HookRepository(db.collection('hooks')),
    widget: new WidgetRepository(db.collection('widgets')),
  });

  const creativeService = new CreativeService();
  const publisherService = new PublisherService(fastify.repository.publisher);
  const campaignService = new CampaignService(fastify.repository.campaign);

  fastify.decorate('service', {
    trace: new TraceService(fastify.repository.trace, fastify.repository.profile),
    publisher: publisherService,
    campaign: campaignService,
    flow: new FlowService(publisherService, campaignService, config),
    creative: creativeService,
    markup: new AdMarkupService(creativeService, config),
    impression: new ImpressionService(fastify.repository.impression),
    user: new UserService(fastify.repository.user),
    hook: new HookService(fastify.repository.hook, fastify.repository.user, fastify.repository.widget),
    widget: new WidgetService(fastify.mongo, fastify.repository.widget, fastify.repository.user),
  });

  fastify.decorate('controller', {
    ad: new AdController(fastify.service.markup),
    trace: new TraceController(fastify.service.trace),
    flow: new FlowController(fastify.service.flow),
    impression: new ImpressionController(fastify.service.impression),
    user: new UserController(fastify.service.user),
    listing: new ListingController(),
    hook: new HookController(fastify.service.hook, config),
    widget: new WidgetController(fastify.service.widget, config),
  });
});

declare module 'fastify' {
  export interface FastifyInstance {
    repository: {
      profile: ProfileRepository;
      trace: TraceRepository;
      impression: ImpressionRepository;
      publisher: PublisherRepository;
      campaign: CampaignRepository;
      user: UserRepository;
      hook: HookRepository;
      widget: WidgetRepository;
    };
    service: {
      trace: TraceService;
      flow: FlowService;
      markup: AdMarkupService;
      impression: ImpressionService;
      creative: CreativeService;
      user: UserService;
      hook: HookService;
      widget: WidgetService;
    };
    controller: {
      ad: AdController;
      trace: TraceController;
      flow: FlowController;
      impression: ImpressionController;
      user: UserController;
      listing: ListingController;
      hook: HookController;
      widget: WidgetController;
    };
  }
}
