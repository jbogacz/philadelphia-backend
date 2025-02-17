import { FastifyInstance } from 'fastify';
import { readFile } from 'fs/promises';
import { CreateIndexesOptions, IndexSpecification } from 'mongodb';

/**
 * TODO: Implement mechanism to read json collection based on the schema. Currently we
 *       use extended JSON syntax that imports the date as { $date: '2021-09-01T00:00:00.000Z' }
 **/
async function uploadToCollection(fastify: FastifyInstance, collectionName: string, data: any[], idField: string): Promise<void> {
  await fastify.mongo.db?.collection(collectionName).bulkWrite(
    data.map((item) => ({
      updateOne: {
        filter: { [idField]: item[idField] },
        update: { $set: item },
        upsert: true,
      },
    }))
  );
  fastify.log.info(`Seeded ${collectionName}: ${data.length}`);
}

async function createIndex(
  fastify: FastifyInstance,
  collectionName: string,
  indexSpec: IndexSpecification,
  options?: CreateIndexesOptions
) {
  await fastify.mongo.db?.collection(collectionName).createIndex(indexSpec, options);
  fastify.log.info(`Created index for '${collectionName}'. (${JSON.stringify(indexSpec)}, ${JSON.stringify(options)})`);
}

export async function seed(fastify: FastifyInstance): Promise<void> {
  try {
    const campaigns = JSON.parse(await readFile('src/maintenance/campaign_data.json', 'utf-8'));
    await uploadToCollection(fastify, 'campaigns', campaigns, 'campaignId');

    const publishers = JSON.parse(await readFile('src/maintenance/publisher_data.json', 'utf-8'));
    await uploadToCollection(fastify, 'publishers', publishers, 'publisherId');

    // const users = JSON.parse(await readFile('src/maintenance/user_data.json', 'utf-8'));
    // await uploadToCollection(fastify, 'users', users, 'userId');
  } catch (error) {
    console.error('Failed to seed database:', error);
  }
}

export async function createIndexes(fastify: FastifyInstance): Promise<void> {
  try {
    await createIndex(fastify, 'users', { id: 1 }, { unique: true });
  } catch (error) {
    console.error('Failed to create indexes:', error);
  }
}
