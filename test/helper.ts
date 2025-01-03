const helper = require('fastify-cli/helper.js');
import { FastifyMongoNestedObject, FastifyMongoObject } from '@fastify/mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as test from 'node:test';
import * as path from 'path';


declare module 'fastify' {
  interface FastifyInstance {
    mongo: FastifyMongoObject & FastifyMongoNestedObject;
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
async function config() {
  const mongoUri = await MongoHelper.getUri();
  return {
    mongodb: {
      url: mongoUri,
      database: 'testdb'
    },
    // This is the most important bit that provides configuration from app.ts
    skipOverride: true
  };
}

// Automatically build and tear down our instance
async function build(t: TestContext) {
  const fastify = await helper.build([AppPath], await config());

  await fastify.ready();

  t.after(async () => {
    await fastify.close();
    await MongoHelper.cleanup();
    // await delay(2000);
  });

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

export { build, clearDatabase, config, MongoHelper };
