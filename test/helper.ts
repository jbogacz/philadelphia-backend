// This file contains code that we reuse between our tests.
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

// Fill in this config with all the configurations
// needed for testing the application
async function config() {
  const mongoUri = await MongoHelper.getUri();
  return {
    mongodb: {
      url: mongoUri,
      database: 'testdb'
    },
    skipOverride: true
  };
}

// Automatically build and tear down our instance
async function build(t: TestContext) {
  const argv = [AppPath];
  const fastify = await helper.build(argv, await config());

  await fastify.ready();

  t.after(async () => {
    await fastify.close();
    await MongoHelper.cleanup();
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
