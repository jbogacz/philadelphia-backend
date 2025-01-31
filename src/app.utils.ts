import { FastifyInstance } from 'fastify';
import { readFile } from 'fs/promises';

/**
 * TODO: Implement mechanism to read json collection based on the schema. Currently we
 *       use extended JSON syntax that imports the date as { $date: '2021-09-01T00:00:00.000Z' }
 **/
export async function seed(fastify: FastifyInstance): Promise<void> {
  try {
    const campaigns = JSON.parse(await readFile('./src/campaign_data.json', 'utf-8'));
    await fastify.mongo.db?.collection('campaigns').bulkWrite(
      campaigns.map((item: any) => ({
        updateOne: {
          filter: { campaignId: item.campaignId },
          update: {
            $set: item,
          },
          upsert: true,
        },
      })),
    );
    fastify.log.info('Seeded campaigns: ' + campaigns.length);

    const publishers = JSON.parse(await readFile('./src/publisher_data.json', 'utf-8'));
    await fastify.mongo.db?.collection('publishers').bulkWrite(
      publishers.map((item: any) => ({
        updateOne: {
          filter: { publisherId: item.publisherId },
          update: {
            $set: item,
          },
          upsert: true,
        },
      })),
    );
    fastify.log.info('Seeded publishers: ' + publishers.length);

  } catch (error) {
    console.error('Failed to seed database:', error);
  }
}
