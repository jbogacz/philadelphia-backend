import { test } from 'node:test';
import assert from 'node:assert';
import { build, clearDatabase } from '../../helper';
import { Collection, ObjectId } from 'mongodb';
import { ImpressionRepository } from '../../../src/features/ad/impression.repository';
import { Impression, ImpressionType } from '../../../src/features/ad/ad.types';

test('impression:repository', async t => {
  const fastify = await build(t);
  const collection: Collection = fastify.mongo.db.collection('impressions');
  const impressionRepository: ImpressionRepository = fastify.repository.impression;

  t.before(async () => {
    await clearDatabase(fastify);
  });

  await t.test('should create new impression', async () => {
    // given
    const impression: Impression = {
      type: ImpressionType.RENDERED,
      traceId: 'trace-1',
      fingerprintId: 'fingerprint-1',
      publisherId: 'publisher-1',
      campaignId: 'campaign-1',
      advertiserId: 'advertiser-1',
      creativeId: 'creative-1',
    };

    // when
    var saved: Impression = await impressionRepository.save(impression);

    // then
    assert.ok(saved._id);
    assert.ok(await collection.findOne({ _id: new ObjectId(saved._id) }));
  });
});
