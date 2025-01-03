import fp from 'fastify-plugin';
import { Client } from 'minio';
import { AppOptions } from '../app.types';
import { FileStorage } from '../common/file.storage';

export default fp<AppOptions>(async (fastify, opts) => {
  const minioClient = new Client(opts.minio);
  fastify.decorate('minio', minioClient);
  fastify.decorate('fileStorage', new FileStorage(minioClient, opts.config));
});

declare module 'fastify' {
  export interface FastifyInstance {
    minio: Client;
    fileStorage: FileStorage;
  }
}
