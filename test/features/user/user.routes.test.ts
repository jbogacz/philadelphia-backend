import * as assert from 'node:assert';
import { test } from 'node:test';
import { UserDto, UserRole } from '../../../src/features/user/user.types';
import { build, clearDatabase } from '../../helper';

test('user:routes', async (t) => {
  const fastify = await build(t);

  const userId = 'dummy-1';
  const email = 'test@philadelphia.com';
  const role = UserRole.USER;

  var registered: UserDto;

  t.before(async () => {
    await clearDatabase(fastify);
  });

  await t.test('should return 200 when login is successful', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/api/users',
      payload: {
        userId: userId,
        email: email,
        role: role,
      },
    });

    assert.equal(response.statusCode, 201);
    assert.equal(response.json().email, email);
    assert.equal(response.json().role, role);
    assert.ok(response.json().apiKey);

    registered = response.json();
  });

  await t.test('should return 404 when user is not found', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/users/unknown',
    });

    assert.equal(response.statusCode, 404);
  });

  await t.test('should return 200 when user is found', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/users/' + userId,
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.json().email, email);
    assert.equal(response.json().role, role);
    assert.equal(response.json().apiKey, registered.apiKey);
  });
});
