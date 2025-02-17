import fp from 'fastify-plugin';
import type { Db } from 'mongodb';
import { AppConfig } from '../app.types';
import { AdController } from '../features/ad/ad.controller';
import { AdMarkupService } from '../features/ad/ad.markup.service';
import { CreativeService } from '../features/ad/creative.service';
import { ImpressionController } from '../features/ad/impression.controller';
import { ImpressionRepository } from '../features/ad/impression.repository';
import { ImpressionService } from '../features/ad/impression.service';
import { AuthController } from '../features/auth/auth.controller';
import { AuthService } from '../features/auth/auth.service';
import { UserController } from '../features/auth/user.controller';
import { UserRepository } from '../features/auth/user.repository';
import { UserService } from '../features/auth/user.service';
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

export interface SupportPluginOptions {
  config: AppConfig;
}

export default fp<SupportPluginOptions>(async (fastify, opts) => {
  const { config } = opts;
  const db: Db = fastify.mongo.db!;

  fastify.decorate('repository', {
    profile: new ProfileRepository(db.collection('profiles')),
    trace: new TraceRepository(db.collection('traces')),
    impression: new ImpressionRepository(db.collection('impressions')),
    publisher: new PublisherRepository(db.collection('publishers')),
    campaign: new CampaignRepository(db.collection('campaigns')),
    user: new UserRepository(db.collection('users')),
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
    auth: new AuthService(fastify.repository.user),
    user: new UserService(fastify.repository.user),
  });

  fastify.decorate('controller', {
    ad: new AdController(fastify.service.markup),
    trace: new TraceController(fastify.service.trace),
    flow: new FlowController(fastify.service.flow),
    impression: new ImpressionController(fastify.service.impression),
    auth: new AuthController(fastify.service.auth),
    user: new UserController(fastify.service.user),
    listing: new ListingController(),
  });
});

// When using .decorate you have to specify added properties for Typescript
declare module 'fastify' {
  export interface FastifyInstance {
    repository: {
      profile: ProfileRepository;
      trace: TraceRepository;
      impression: ImpressionRepository;
      publisher: PublisherRepository;
      campaign: CampaignRepository;
      user: UserRepository;
    };
    service: {
      trace: TraceService;
      flow: FlowService;
      markup: AdMarkupService;
      impression: ImpressionService;
      creative: CreativeService;
      user: UserService;
      auth: AuthService;
    };
    controller: {
      ad: AdController;
      trace: TraceController;
      flow: FlowController;
      impression: ImpressionController;
      auth: AuthController;
      user: UserController;
      listing: ListingController;
    };
  }
}
