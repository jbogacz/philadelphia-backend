import fp from 'fastify-plugin';
import type { Db } from 'mongodb';
import { ProfileRepository } from '../features/trace/profile.repository';
import { TraceService } from '../features/trace/trace.service';
import { AdMarkupService } from '../features/ad/ad.markup.service';
import { AdController } from '../features/ad/ad.controller';
import { TraceController } from '../features/trace/trace.controller';
import { ImpressionService } from '../features/ad/impression.service';
import { ImpressionController } from '../features/ad/impression.controller';
import { TraceRepository } from '../features/trace/trace.repository';
import { AppConfig } from '../app.types';
import { ImpressionRepository } from '../features/ad/impression.repository';
import { CreativeService } from '../features/ad/creative.service';
import { FlowController } from '../features/flow/flow.controller';
import { FlowService } from '../features/flow/flow.service';
import { PublisherService } from '../features/publisher/publisher.service';
import { CampaignService } from '../features/campaign/campaign.service';
import { CampaignRepository } from '../features/campaign/campaign.repository';

export interface SupportPluginOptions {
  // Specify Support plugin options here
  config: AppConfig;
}

// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp<SupportPluginOptions>(async (fastify, opts) => {
  const { config } = opts;
  const db: Db = fastify.mongo.db!;

  fastify.decorate('repository', {
    profile: new ProfileRepository(db.collection('profiles')),
    trace: new TraceRepository(db.collection('traces')),
    impression: new ImpressionRepository(db.collection('impressions')),
    campaign: new CampaignRepository(db.collection('campaigns')),
  });

  const creativeService = new CreativeService(fastify.fileStorage);
  const publisherService = new PublisherService();
  const campaignService = new CampaignService();

  fastify.decorate('service', {
    trace: new TraceService(fastify.repository.trace, fastify.repository.profile),
    publisher: publisherService,
    campaign: campaignService,
    flow: new FlowService(publisherService, campaignService, config),
    creative: creativeService,
    markup: new AdMarkupService(creativeService, config),
    impression: new ImpressionService(fastify.repository.impression),
  });

  fastify.decorate('controller', {
    ad: new AdController(fastify.service.markup),
    trace: new TraceController(fastify.service.trace),
    flow: new FlowController(fastify.service.flow),
    impression: new ImpressionController(fastify.service.impression),
  });
});

// When using .decorate you have to specify added properties for Typescript
declare module 'fastify' {
  export interface FastifyInstance {
    repository: {
      profile: ProfileRepository;
      trace: TraceRepository;
      impression: ImpressionRepository;
      campaign: CampaignRepository;
    };
    service: {
      trace: TraceService;
      flow: FlowService;
      markup: AdMarkupService;
      impression: ImpressionService;
      creative: CreativeService;
    };
    controller: {
      ad: AdController;
      trace: TraceController;
      flow: FlowController;
      impression: ImpressionController;
    };
  }
}
