import fp from 'fastify-plugin';
import type { Db } from 'mongodb';
import { ProfileRepository } from '../features/trace/profile.repository';
import { TraceService } from '../features/trace/trace.service';
import { AdService } from '../features/ad/ad.service';
import { AdController } from '../features/ad/ad.controller';
import { TraceController } from '../features/trace/trace.controller';
import { ImpressionService } from '../features/ad/impression.service';
import { ImpressionController } from '../features/ad/impression.controller';
import { TraceRepository } from '../features/trace/trace.repository';
import { AppConfig } from '../app.types';
import { ImpressionRepository } from '../features/ad/impression.repository';

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
  });

  fastify.decorate('service', {
    trace: new TraceService(fastify.repository.trace, fastify.repository.profile),
    ad: new AdService(config),
    impression: new ImpressionService(fastify.repository.impression),
  });

  fastify.decorate('controller', {
    ad: new AdController(fastify.service.ad),
    trace: new TraceController(fastify.service.trace),
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
    };
    service: {
      trace: TraceService;
      ad: AdService;
      impression: ImpressionService;
    };
    controller: {
      ad: AdController;
      trace: TraceController;
      impression: ImpressionController;
    };
  }
}
