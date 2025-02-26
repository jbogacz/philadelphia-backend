import * as assert from 'node:assert';
import { test } from 'node:test';
import { build, clearDatabase } from '../../helper';
import { Hook } from '../../../src/features/hook/hook.types';

test('widget:routes', async (t) => {
  const fastify = await build(t);
  const userRepository = fastify.repository.user;
  const hookRepository = fastify.repository.hook;

  let userId: string = 'qux';
  let widget: any;
  let hook: Hook;

  t.before(async () => {
    await clearDatabase(fastify);

    await userRepository.save({
      userId: userId,
      email: 'test@user.com',
      role: 'user',
    });
    hook = await hookRepository.save({
      name: 'foo',
      domain: 'bar',
      favicon: 'baz',
      userId: userId,
    });
  });

  await t.test('should register new pending widget', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/api/widgets',
      headers: {
        'x-user-id': userId,
      },
    });

    assert.equal(response.statusCode, 200);
    widget = response.json();

    assert.ok(widget._id);
    assert.equal(widget.status, 'pending');
    assert.equal(widget.userId, userId);
  });

  await t.test('should return existing pending widget', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/api/widgets',
      headers: {
        'x-user-id': userId,
      },
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.json()._id, widget._id);
  });

  await t.test('should return 404 when trying to register widget with invalid userId', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/api/widgets',
      headers: {
        'x-user-id': 'unknown',
      },
    });
    assert.equal(response.statusCode, 404);
    assert.equal(response.json().error, 'NotFoundError');
    assert.equal(response.json().message, 'User not found: unknown');
    assert.equal(response.json().code, 404);
  });

  await t.test('should return 401 when trying to register widget without userId', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/api/widgets',
    });
    assert.equal(response.statusCode, 401);
    assert.equal(response.json().error, 'Unauthorized');
    assert.equal(response.json().code, 401);
  });

  await t.test('should update widget with hookId and skip other fields', async () => {
    const response = await fastify.inject({
      method: 'PUT',
      url: '/api/widgets/' + widget._id,
      payload: {
        hookId: hook._id,
        status: 'active',
        userId: 'updated',
      },
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.json()._id, widget._id);
    assert.equal(response.json().hookId, hook._id);
    assert.equal(response.json().status, 'pending');
    assert.equal(response.json().userId, userId);
  });
});
