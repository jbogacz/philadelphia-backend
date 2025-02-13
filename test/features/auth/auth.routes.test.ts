import { test } from 'node:test';
import { build, clearDatabase } from '../../helper';
import { AuthRequest, UserRole } from '../../../src/features/auth/auth.types';
import * as assert from 'node:assert';
import { UserRepository } from '../../../src/features/auth/user.repository';

test('auth:routes', async (t) => {
  const fastify = await build(t);
  const userRepository: UserRepository = fastify.repository.user;

  t.before(async () => {
    await clearDatabase(fastify);

    await userRepository.save({
      email: 'test@philadelphia.com',
      password: '123456',
      role: UserRole.USER,
    });
  });

  await t.test('should return 200 when login is successful', async () => {
    const request: AuthRequest = {
      email: 'test@philadelphia.com',
      password: '123456',
    };

    const response = await fastify.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: request,
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.json().token.length, 36);
    assert.equal(response.json().user.email, request.email);
    assert.equal(response.json().user.role, 'user');
  });

  await t.test('should return 401 when login failed', async () => {
    const request: AuthRequest = {
      email: 'bad@login.com',
      password: '123456',
    };

    const response = await fastify.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: request,
    });

    assert.equal(response.statusCode, 401);
  });
});
