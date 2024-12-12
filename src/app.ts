import { join } from 'path';
import AutoLoad, { AutoloadPluginOptions } from '@fastify/autoload';
import { FastifyPluginAsync, FastifyServerOptions } from 'fastify';
import mongodb from '@fastify/mongodb';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';

export interface AppOptions
  extends FastifyServerOptions,
    Partial<AutoloadPluginOptions> {}
// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {};

const app: FastifyPluginAsync<AppOptions> = async (
  fastify,
  opts
): Promise<void> => {
  void fastify.register(mongodb, {
    url: 'mongodb://localhost:27017',
    database: 'testdb',
    auth: {
      username: 'admin',
      password: 'password123'
    },
  });

  void fastify.register(swagger, {
    swagger: {
      info: {
        title: 'philadelphia-backend',
        version: '0.1.0',
      },
    },
  });

  void fastify.register(swaggerUI, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false,
    },
  });

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: opts,
  });

  // This loads all plugins defined in routes
  // define your routes in one of these
  // void fastify.register(AutoLoad, {
  //   dir: join(__dirname, 'routes'),
  //   options: opts,
  // });
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'features'),
    dirNameRoutePrefix: false, // Don't use directory names as prefixes
    indexPattern: /index\.ts$/, // Look for index.ts files
    options: { prefix: '/api' },
  });
};

export default app;
export { app, options };
