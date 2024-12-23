import { test } from 'node:test';
import * as assert from 'node:assert';
import { build } from '../../helper';

test('ad:routes', async t => {
  const app = await build(t);

  await t.test('should serve sample ad code', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/ad?targetId=ad-container&fingerprintId=123',
    });

    assert.equal(response.statusCode, 200);
    assert.ok(response.body);
  });
});
