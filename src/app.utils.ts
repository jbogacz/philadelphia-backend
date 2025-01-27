import { FastifyInstance } from 'fastify';
import { readFile } from 'fs/promises';

/**
 * TODO: Implement mechanism to read json collection based on the schema. Currently we
 *       use extended JSON syntax that imports the date as { $date: '2021-09-01T00:00:00.000Z' }
 **/
export async function seed(fastify: FastifyInstance): Promise<void> {
  try {
    const file = JSON.parse(await readFile('./src/campaign_data.json', 'utf-8'));
    await fastify.mongo.db?.collection('campaigns').bulkWrite(
      file.map((item: any) => ({
        updateOne: {
          filter: { campaignId: item.campaignId },
          update: {
            $set: item,
          },
          upsert: true,
        },
      })),
    );
  } catch (error) {
    console.error('Failed to seed database:', error);
  }
}
