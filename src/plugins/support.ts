import fp from 'fastify-plugin';
import { ProfileRepository2 } from '../features/trace/profile.repository';
import type { Db } from 'mongodb';
import { BaseRepository } from '../features/base.repository';
import { Profile } from '../features/trace/trace.types';

export interface SupportPluginOptions {
  // Specify Support plugin options here
}

// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp<SupportPluginOptions>(async (fastify, opts) => {
  const db: Db = fastify.mongo.db!;

  fastify.decorate('repository', {
    profile: new ProfileRepository2(db.collection('profiles')),
    test: new BaseRepository<Profile>(db.collection('profiles'))
  });
});

// When using .decorate you have to specify added properties for Typescript
declare module 'fastify' {
  export interface FastifyInstance {
    repository: {
      profile: ProfileRepository2;
      test: BaseRepository<Profile>;
    };
  }
}
