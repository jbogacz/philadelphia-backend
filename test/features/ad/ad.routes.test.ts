import { test } from 'node:test';
import * as assert from 'node:assert';
import { build, MongoHelper } from '../../helper';

test('ad:routes', async t => {
  const fastify = await build(t);

  await t.test('should serve sample ad code', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/ad?targetId=ad-container&publisherId=publisher-123',
    });

    assert.equal(response.statusCode, 200);
    assert.ok(response.body);
  });

  // await t.test('should capture impression', async () => {
  //   const response = await fastify.inject({
  //     method: 'GET',
  //     url: '/api/impression?type=rendered&traceId=trace-1&fingerprintId=fingerprint-1&publisherId=publisher-1&campaignId=campaign-1&advertiserId=advertiser-1&creativeId=creative-1',
  //   });

  //   assert.equal(response.statusCode, 200);
  //   assert.ok(response.body);
  // });
});
