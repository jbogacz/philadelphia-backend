import AutoLoad, { AutoloadPluginOptions } from '@fastify/autoload';
import mongodb from '@fastify/mongodb';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import cors from '@fastify/cors';
import { FastifyPluginAsync, FastifyServerOptions } from 'fastify';
import { join } from 'path';
import { LoggerService } from './common/logger.service';

export interface AppOptions extends FastifyServerOptions, Partial<AutoloadPluginOptions> {
  traces?: {
    apiUrl?: string;
  };
  impressions?: {
    apiUrl?: string;
  };
  mongodb?: {
    url: string;
    database: string;
    auth?: {
      username: string;
      password: string;
    };
  };
}

const appOptions: AppOptions = {
  traces: {
    apiUrl: process.env.TRACES_API_URL,
  },
  impressions: {
    apiUrl: process.env.IMPRESSIONS_API_URL,
  },
  mongodb: {
    url: process.env.MONGODB_URL!,
    database: process.env.MONGODB_DATABASE!,
    auth: {
      username: process.env.MONGODB_AUTH_USERNAME!,
      password: process.env.MONGODB_AUTH_PASSWORD!,
    },
  },
};

// Pass --options via CLI arguments in command to enable these options.
const app: FastifyPluginAsync<AppOptions> = async (fastify, cliOptions): Promise<void> => {
  const options = { ...appOptions, ...cliOptions };
  console.log('Fastify options', options);

  if (!options.mongodb) {
    throw new Error('MongoDB options are required');
  }

  void fastify.register(mongodb, options.mongodb);

  await fastify.after(); // Wait for mongodb plugin to register

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

  void fastify.register(cors, {
    origin: true, // or specify origins like ['http://localhost:8080']
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
  });

  // void fastify.addHook('onRequest', (request, reply, done) => {
  //   console.log('Request:', request.headers.origin);
  //   reply.header('Access-Control-Allow-Origin', request.headers.origin);
  //   reply.header('Access-Control-Allow-Credentials', 'true');
  //   done();
  // });

  void fastify.register(async server => {
    LoggerService.initialize(server.log);
  });

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: options,
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
export { app, appOptions };
