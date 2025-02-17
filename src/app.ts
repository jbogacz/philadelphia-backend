import 'dotenv/config';
import AutoLoad from '@fastify/autoload';
import cors from '@fastify/cors';
import mongodb from '@fastify/mongodb';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import { FastifyPluginAsync } from 'fastify';
import { join } from 'path';
import { AppOptions } from './app.types';
import { LoggerService } from './common/logger.service';
import { seed } from './maintenance/maintenance.utils';

const clearEnvCache = () => {
  Object.keys(process.env).forEach((key) => {
    delete process.env[key];
  });
  require('dotenv').config(); // Reload .env
};
clearEnvCache();

// Load environment variables from .env file
const appOptions: AppOptions = {
  env: process.env.NODE_ENV,
  config: {
    trace: {
      apiUrl: process.env.TRACE_API_URL!,
    },
    impression: {
      apiUrl: process.env.IMPRESSION_API_URL!,
    },
    flow: {
      apiUrl: process.env.FLOW_API_URL!,
    }
  },
  mongodb: {
    url: process.env.MONGODB_URL!,
    database: process.env.MONGODB_DATABASE!,
  }
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

  void fastify.register(async (fastify) => {
    if (process.env.NODE_ENV === 'development') {
      await seed(fastify);
    }
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
      docExpansion: 'list',
      deepLinking: false,
    },
  });

  void fastify.register(cors, {
    origin: ['https://philadelphia-web.vercel.app'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
  });

  void fastify.register(async (server) => {
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
