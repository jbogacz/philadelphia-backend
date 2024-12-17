import { MongoMemoryServer } from 'mongodb-memory-server';
import * as test from 'node:test';
import * as path from 'path';
const helper = require('fastify-cli/helper.js');

export type TestContext = {
  after: typeof test.after;
};

const AppPath = path.join(__dirname, '..', 'src', 'app.ts');

let mongod: MongoMemoryServer;

// Fill in this config with all the configurations
// needed for testing the application
async function config() {
  // Create new instance of MongoDB Memory Server
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  return {
    // Pass MongoDB configuration to the app
    mongodb: {
      url: uri,
      database: 'testdb'
    },
    skipOverride: true
  };
}

// Automatically build and tear down our instance
async function build(t: TestContext) {
  // you can set all the options supported by the fastify CLI command
  const argv = [AppPath];

  // fastify-plugin ensures that all decorators
  // are exposed for testing purposes, this is
  // different from the production setup
  const fastify = await helper.build(argv, await config());

  // Tear down our app and MongoDB after we are done
  t.after(async () => {
    await fastify.close();
    if (mongod) {
      await mongod.stop();
    }
  });

  return fastify;
}

// Add utility function to get MongoDB instance (useful for test cleanup)
async function getMongod() {
  return mongod;
}

export { build, config, getMongod };
