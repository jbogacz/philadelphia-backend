import { ObjectId, type Db } from 'mongodb';
import * as assert from 'node:assert';
import { test } from 'node:test';
import { HookRepository } from '../../../src/features/hook/hook.repository';
import { Hook } from '../../../src/features/hook/hook.types';
import { Demand, DemandDto } from '../../../src/features/marketplace/marketplace.types';
import { UserRepository } from '../../../src/features/user/user.repository';
import { User, UserRole } from '../../../src/features/user/user.types';
import { build, clearDatabase } from '../../helper';

test('demand.routes', async (t) => {
  const fastify = await build(t);
  const db: Db = fastify.mongo.db;
  const userRepository: UserRepository = fastify.repository.user;
  const hookRepository: HookRepository = fastify.repository.hook;

  let user: User;
  let hook: Hook;
  let demand: Demand;

  t.before(async () => {
    await clearDatabase(fastify);

    user = await userRepository.create({
      userId: 'qux',
      email: 'test@user.com',
      role: UserRole.USER,
    });

    hook = await hookRepository.create({
      name: 'foo',
      domain: 'bar',
      favicon: 'baz',
      userId: user.userId as string,
      description: 'baz',
      widgetId: '123',
    });
  });

  await t.test('should create new document', async () => {
    const payload: DemandDto = {
      hookId: hook._id as string,
      userId: user.userId as string,
      title: 'foo',
      description: 'bar',
      goal: 1000,
      budget: { min: 100, max: 1000 },
      duration: 30,
      audience: 'baz',
    };

    const createResponse = await fastify.inject({
      method: 'POST',
      url: '/api/demands',
      headers: {
        'x-user-id': user.userId,
      },
      payload: payload,
    });

    demand = createResponse.json() as Demand;

    assert.equal(createResponse.statusCode, 201);

    const document = await db.collection('demands').findOne({ _id: ObjectId.createFromHexString(demand._id!) });
    assert.ok(document);
    assert.equal(document.hookId.toString(), payload.hookId.toString());
    assert.equal(document.userId, payload.userId);
    assert.equal(document.title, payload.title);
    assert.equal(document.description, payload.description);
    assert.equal(document.goal, payload.goal);
    assert.equal(document.budget.min, payload.budget.min);
    assert.equal(document.budget.max, payload.budget.max);
    assert.equal(document.duration, payload.duration);
    assert.equal(document.status, 'open');
  });

  await t.test('should return list of traffic requests', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/demands',
      headers: {
        'x-user-id': user.userId,
      },
    });

    assert.equal(response.statusCode, 200);
    assert.ok(response.json().length > 0);
  });

  await t.test('should find by query', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: `/api/demands?userId=${user.userId}&status=open&hookId=${hook._id}`,
      headers: {
        'x-user-id': user.userId,
      },
    });
    assert.equal(response.statusCode, 200);
    assert.ok(response.json().length > 0);
  });

  await t.test('should update document', async () => {
    const response = await fastify.inject({
      method: 'PUT',
      url: `/api/demands/${demand._id}`,
      headers: {
        'x-user-id': user.userId,
      },
      payload: {
        title: 'updated title',
        description: 'updated description',
      },
    });

    assert.equal(response.statusCode, 200);

    const updated = await db.collection('demands').findOne({ _id: ObjectId.createFromHexString(demand._id!) });
    assert.equal(updated?.title, 'updated title');
    assert.equal(updated?.description, 'updated description');
  });
});
