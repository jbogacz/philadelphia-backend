import fp from 'fastify-plugin';
import { ProfileRepository } from '../features/trace/profile.repository';
import type { Db } from 'mongodb';

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
});

// When using .decorate you have to specify added properties for Typescript
declare module 'fastify' {
  export interface FastifyInstance {
    repository: {
      profile: ProfileRepository;
    };
  }
}
