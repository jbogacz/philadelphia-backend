const helper = require('fastify-cli/helper.js');
import { FastifyMongoNestedObject, FastifyMongoObject } from '@fastify/mongodb';
import { ClientSession } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as test from 'node:test';
import * as path from 'path';
import { txTemplate } from '../src/features/base.repository';
import { TraceRepository } from '../src/features/trace/trace.repository';
import { PublisherRepository } from '../src/features/publisher/publisher.repository';
import { UserRepository } from '../src/features/user/user.repository';
import { HookRepository } from '../src/features/hook/hook.repository';
import { WidgetRepository } from '../src/features/widget/widget.repository';
import { PartnershipRepository } from '../src/features/partnership/partnership.repository';
import { DemandRepository } from '../src/features/marketplace/demand/demand.repository';
import { OfferRepository } from '../src/features/marketplace/offer/offer.repository';
import { CampaignRepository as CampaignRepositoryDeprecated } from '../src/features/campaign/campaign.repository';
import { CampaignRepository } from '../src/features/marketplace/campaign/campaign.repository';

declare module 'fastify' {
  interface FastifyInstance {
    mongo: FastifyMongoObject & FastifyMongoNestedObject;
    cacheManager: any;
    repository: {
      trace: TraceRepository;
      publisher: PublisherRepository;
      user: UserRepository;
      hook: HookRepository;
      widget: WidgetRepository;
      partnership: PartnershipRepository;
      demand: DemandRepository;
      offer: OfferRepository;
      campaignDeprecated: CampaignRepositoryDeprecated;
      campaign: CampaignRepository;
    };
  }
}

export type TestContext = {
  after: typeof test.after;
};

const AppPath = path.join(__dirname, '..', 'src', 'app.ts');

class MongoHelper {
  private static instance: MongoMemoryServer | null = null;

  static async getUri(): Promise<string> {
    if (!this.instance) {
      this.instance = await MongoMemoryServer.create();
    }
    return this.instance.getUri();
  }

  static async cleanup(): Promise<void> {
    if (this.instance) {
      await this.instance.stop();
      this.instance = null;
    }
  }
}

// This config is used as AppOptions in Fastify and configures embedded Mongo
async function createTestConfig() {
  const mongoUri = await MongoHelper.getUri();
  return {
    mongodb: {
      url: mongoUri,
      database: 'testdb',
    },
    config: {
      apiUrl: 'http://backend.com/api',
      isProduction: () => false,
      isDevelopment: () => true,
      scheduler: {
        campaign: {
          enabled: false,
          cron: '',
        },
      },
    },
    // This is the most important bit that provides configuration from app.ts
    skipOverride: true,
    seedDemoData: false,
  };
}

// Automatically build and tear down our instance
async function build(t: TestContext) {
  const fastify = await helper.build([AppPath], await createTestConfig());

  await fastify.ready();

  t.after(async () => {
    await fastify.close();
    await MongoHelper.cleanup();
  });

  // Embedded Mongo does not support transactions so we mock it
  txTemplate.withTransaction = (_: any) => async (fn) => {
    return await fn(undefined as unknown as ClientSession);
  };
  console.warn('helper.ts', '## DB transactions disabled for embedded Mongo ##');

  return fastify;
}

// Add utility function to clear database between tests
async function clearDatabase(app: any) {
  const db = app.mongo.db;
  if (db) {
    const collections = await db.listCollections().toArray();
    for (const collection of collections) {
      await db.collection(collection.name).deleteMany({});
    }
  }
}

export { build, clearDatabase, createTestConfig as config, MongoHelper };
