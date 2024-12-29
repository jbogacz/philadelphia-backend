import fp from 'fastify-plugin';
import type { Db } from 'mongodb';
import { ProfileRepository } from '../features/trace/profile.repository';
import { TraceService } from '../features/trace/trace.service';
import { AdService } from '../features/ad/ad.service';
import { AdController } from '../features/ad/ad.controller';
import { TraceController } from '../features/trace/trace.controller';
import { ImpressionService } from '../features/impression/impression.service';
import { ImpressionController } from '../features/impression/impression.controller';
import { TraceRepository } from '../features/trace/trace.repository';

export interface SupportPluginOptions {
  // Specify Support plugin options here
}

// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp<SupportPluginOptions>(async (fastify, opts) => {
  const db: Db = fastify.mongo.db!;

  fastify.decorate('repository', {
    profile: new ProfileRepository(db.collection('profiles')),
    trace: new TraceRepository(db.collection('traces')),
  });

  fastify.decorate('service', {
    trace: new TraceService(fastify.repository.trace, fastify.repository.profile),
    ad: new AdService(),
    impression: new ImpressionService(),
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
