import fp from 'fastify-plugin';
import type { Db } from 'mongodb';
import { ProfileRepository } from '../features/trace/profile.repository';
import { TraceService } from '../features/trace/trace.service';
import { AdService } from '../features/ad/ad.service';
import { AdController } from '../features/ad/ad.controller';
import { TraceController } from '../features/trace/trace.controller';

export interface SupportPluginOptions {
  // Specify Support plugin options here
}

// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp<SupportPluginOptions>(async (fastify, opts) => {
  const db: Db = fastify.mongo.db!;

  fastify.decorate('repository', {
    profile: new ProfileRepository(db.collection('profiles')),
  });

  fastify.decorate('service', {
    trace: new TraceService(fastify.repository.profile),
    ad: new AdService(),
  });

  fastify.decorate('controller', {
    ad: new AdController(fastify.service.ad),
    trace: new TraceController(fastify.service.trace),
  });
});

// When using .decorate you have to specify added properties for Typescript
declare module 'fastify' {
  export interface FastifyInstance {
    repository: {
      profile: ProfileRepository;
    };
    service: {
      trace: TraceService;
      ad: AdService;
    };
    controller: {
      ad: AdController;
      trace: TraceController;
    };
  }
}
