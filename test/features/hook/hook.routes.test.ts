import * as assert from 'node:assert';
import { test } from 'node:test';
import { build, clearDatabase } from '../../helper';
import { HookDto } from '../../../src/features/hook/hook.types';

test('hook:routes', async (t) => {
  const fastify = await build(t);
  const userRepository = fastify.repository.user;

  let hook: any;

  t.before(async () => {
    await clearDatabase(fastify);

    await userRepository.save({
      id: 'qux',
      email: 'test@user.com',
      role: 'user',
    });
  });

  await t.test('should persist hook', async () => {
    const hookDto: HookDto = {
      name: 'foo',
      domain: 'bar',
      favicon: 'baz',
      userId: 'qux',
    };

    const createResponse = await fastify.inject({
      method: 'POST',
      url: '/api/hooks',
      payload: hookDto,
    });

    assert.equal(createResponse.statusCode, 201);
    hook = createResponse.json();

    assert.ok(hook.id);
    assert.equal(hook.name, hookDto.name);
    assert.equal(hook.domain, hookDto.domain);
    assert.equal(hook.favicon, hookDto.favicon);
    assert.equal(hook.userId, hookDto.userId);
  });

  await t.test('should find hook by ID', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: `/api/hooks/${hook.id}`,
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.json().id, hook.id);
    assert.equal(response.json().name, hook.name);
    assert.equal(response.json().domain, hook.domain);
    assert.equal(response.json().favicon, hook.favicon);
    assert.equal(response.json().userId, hook.userId);
  });

  await t.test('should return 404 when trying to create hook with invalid userId', async () => {
    const hookDto: HookDto = {
      name: 'foo',
      domain: 'bar',
      favicon: 'baz',
      userId: '67b5c2ce1290f60c2eb83e19',
    };

    const response = await fastify.inject({
      method: 'POST',
      url: '/api/hooks',
      payload: hookDto,
    });

    assert.equal(response.statusCode, 404);
    assert.equal(response.json().error, 'NotFoundError');
    assert.equal(response.json().message, 'User not found: 67b5c2ce1290f60c2eb83e19');
    assert.equal(response.json().code, 404);
  });

  await t.test('should update hook', async () => {
    const updatedHook: HookDto = {
      id: hook.id,
      name: 'updated',
      domain: 'updated',
      favicon: 'updated',
      userId: 'updated',
    };

    const response = await fastify.inject({
      method: 'PUT',
      url: '/api/hooks',
      payload: updatedHook,
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.json().id, updatedHook.id);
    assert.equal(response.json().name, updatedHook.name);
    assert.equal(response.json().domain, updatedHook.domain);
    assert.equal(response.json().favicon, updatedHook.favicon);
    assert.equal(response.json().userId, hook.userId);
  });

  await t.test('should return 404 when trying to update hook with invalid ID', async () => {
    const updatedHook: HookDto = {
      id: '67b5c2ce1290f60c2eb83e19',
      name: 'updated',
      domain: 'updated',
      favicon: 'updated',
      userId: 'updated',
    };

    const response = await fastify.inject({
      method: 'PUT',
      url: '/api/hooks',
      payload: updatedHook,
    });

    assert.equal(response.statusCode, 404);
    assert.equal(response.json().error, 'NotFoundError');
    assert.equal(response.json().message, 'Hook not found: 67b5c2ce1290f60c2eb83e19');
    assert.equal(response.json().code, 404);
  });

  await t.test('should query updated npm hooks by userId', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/hooks?userId=' + hook.userId,
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.json().length, 1);
    assert.equal(response.json()[0].id, hook.id);
    assert.equal(response.json()[0].userId, hook.userId);
    assert.equal(response.json()[0].name, 'updated');
    assert.equal(response.json()[0].domain, 'updated');
    assert.equal(response.json()[0].favicon, 'updated');
  });
});
