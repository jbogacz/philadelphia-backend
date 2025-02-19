import * as assert from 'node:assert';
import { test } from 'node:test';
import { UserRepository } from '../../../src/features/user/user.repository';
import { UserDto, UserRole } from '../../../src/features/user/user.types';
import { build, clearDatabase } from '../../helper';

test('user:routes', async (t) => {
  const fastify = await build(t);
  const userRepository: UserRepository = fastify.repository.user;

  t.before(async () => {
    await clearDatabase(fastify);
  });

  await t.test('should return 200 when login is successful', async () => {
    const user: UserDto = {
      id: 'dummy-1',
      email: 'test@philadelphia.com',
      role: UserRole.USER,
    };

    const response = await fastify.inject({
      method: 'POST',
      url: '/api/users',
      payload: user,
    });

    assert.equal(response.statusCode, 201);
    assert.equal(response.json().email, user.email);
    assert.equal(response.json().role, 'user');
  });
});
