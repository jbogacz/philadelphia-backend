import { test } from 'node:test';
import * as assert from 'node:assert';
import { build } from '../../helper';

test('trace:routes', async t => {
  const app = await build(t);

  await t.test('should call hello api', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/hello'
    });

    assert.equal(response.statusCode, 200);
    assert.deepEqual(JSON.parse(response.payload), {
      message: 'Hello, World!'
    });
  });
});
