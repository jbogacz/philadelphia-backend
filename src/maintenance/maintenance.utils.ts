import { FastifyInstance } from 'fastify';
import { readFile } from 'fs/promises';

/**
 * TODO: Implement mechanism to read json collection based on the schema. Currently we
 *       use extended JSON syntax that imports the date as { $date: '2021-09-01T00:00:00.000Z' }
 **/
async function uploadToCollection(
  fastify: FastifyInstance,
  collectionName: string,
  data: any[],
  idField: string
): Promise<void> {
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

export async function seed(fastify: FastifyInstance): Promise<void> {
  try {
    const campaigns = JSON.parse(await readFile('src/maintenance/campaign_data.json', 'utf-8'));
    await uploadToCollection(fastify, 'campaigns', campaigns, 'campaignId');

    const publishers = JSON.parse(await readFile('src/maintenance/publisher_data.json', 'utf-8'));
    await uploadToCollection(fastify, 'publishers', publishers, 'publisherId');

    const users = JSON.parse(await readFile('src/maintenance/user_data.json', 'utf-8'));
    await uploadToCollection(fastify, 'users', users, 'userId');

  } catch (error) {
    console.error('Failed to seed database:', error);
  }
}
