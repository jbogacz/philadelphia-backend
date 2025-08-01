import AutoLoad from '@fastify/autoload';
import mongodb from '@fastify/mongodb';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import { FastifyPluginAsync } from 'fastify';
import { join } from 'path';
import { setFastifyInstance } from './app.store';
import { AppOptions } from './app.types';
import { LoggerService } from './common/logger.service';
import { clearEnvCache, mutateObjectIds } from './common/utils';

clearEnvCache();

// Load environment variables from .env file
const appOptions: AppOptions = {
  env: process.env.NODE_ENV,
  config: {
    apiUrl: process.env.API_URL!,
    isProduction: () => process.env.NODE_ENV === 'production',
    isDevelopment: () => process.env.NODE_ENV === 'development',
    scheduler: {
      campaign: {
        enabled: process.env.SCHEDULER_CAMPAIGN_ENABLED === 'true',
        cron: process.env.SCHEDULER_CAMPAIGN_CRON || '',
      },
    },
  },
  mongodb: {
    url: process.env.MONGODB_URL!,
    database: process.env.MONGODB_DATABASE!,
  },
  seedDemoData: process.env.MONGODB_SEED_DEMO_DATA === 'true',
};

// Pass --options via CLI arguments in command to enable these options.
const app: FastifyPluginAsync<AppOptions> = async (fastify, cliOptions): Promise<void> => {
  // Set the Fastify instance at the beginning of the plugin function
  setFastifyInstance(fastify);

  const options = { ...appOptions, ...cliOptions };
  console.log('Fastify options', options);

  if (!options.mongodb) {
    throw new Error('MongoDB options are required');
  }

  void fastify.register(mongodb, options.mongodb);

  await fastify.after();

  if (options.config.isDevelopment()) {
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
  }

  void fastify.register(require('@fastify/cors'), {
    hook: 'preHandler',
    delegator: (req: any, callback: any) => {
      // Forbid CORS for all routes by default
      const corsOptions = {
        origin: false,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
        exposedHeaders: ['Set-Cookie'],
      };
      // Allow CORS for public routes
      if (req.url && req.url.startsWith('/api/public')) {
        corsOptions.origin = true;
        corsOptions.credentials = false;
      }
      callback(null, corsOptions);
    },
  });

  // Add a preHandler hook to convert string ObjectId to ObjectId type
  void fastify.addHook('preHandler', (request, reply, done) => {
    // Transform query parameters
    if (request.query && typeof request.query === 'object') {
      mutateObjectIds(request.query as Record<string, unknown>);
    }
    done();
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

  // Seed demo data
  void fastify.register(async (fastify) => {
    if (options.seedDemoData) {
      // const { seedDemoData } = await import('./maintenance/seed.demo.data.js');
      // await seedDemoData(fastify);
      // const { seedDemoPartnerTraces } = await import('./maintenance/seed.demo.partner.traces.js');
      // await seedDemoPartnerTraces(fastify);
    }
  });
};

export default app;
export { app, appOptions };
