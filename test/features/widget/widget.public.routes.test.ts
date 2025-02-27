import * as assert from 'node:assert';
import { test } from 'node:test';
import { build, clearDatabase } from '../../helper';

test('widget:public:routes', async (t) => {
  const fastify = await build(t);

  t.before(async () => {
    await clearDatabase(fastify);
  });

  await t.test('should generate widget code', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/public/widgets',
      query: {
        apiKey: 'foo',
        widgetKey: 'bar',
      },
    });

    assert.equal(response.statusCode, 200);
    assert.ok(response.payload);
  });
});
