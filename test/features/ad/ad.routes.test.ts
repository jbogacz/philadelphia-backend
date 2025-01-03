import { Collection } from 'mongodb';
import * as assert from 'node:assert';
import { test } from 'node:test';
import { build, clearDatabase } from '../../helper';

test('ad:routes', async t => {
  const fastify = await build(t);
  const collection: Collection = fastify.mongo.db.collection('impressions');

  await t.test('should serve sample ad code', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/ad?targetId=ad-container&publisherId=publisher-123',
    });

    assert.equal(response.statusCode, 200);
    assert.ok(response.body);
  });

  t.before(async () => {
    await clearDatabase(fastify);
  });

  await t.test('should capture impression', async () => {
    const traceId = crypto.randomUUID().toString();
    const response = await fastify.inject({
      method: 'GET',
      url: `/api/impression?type=rendered&traceId=${traceId}&fingerprintId=fingerprint-1&publisherId=publisher-1&campaignId=campaign-1&advertiserId=advertiser-1&creativeId=creative-1`,
    });

    assert.equal(response.statusCode, 200);
    assert.ok(response.body);

    const impression = await collection.findOne({ traceId });
    assert.ok(impression);
  });
});
