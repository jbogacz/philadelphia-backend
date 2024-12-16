import { test } from 'node:test';
import * as assert from 'node:assert';
import { build } from '../../helper';

test('hello route', async t => {
  const app = await build(t);

  const response = await app.inject({
    method: 'GET',
    url: '/api/hello'
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(JSON.parse(response.payload), {
    message: 'Hello, World!'
  });
});
