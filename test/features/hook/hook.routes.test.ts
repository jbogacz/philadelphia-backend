import * as assert from 'node:assert';
import { test } from 'node:test';
import { build, clearDatabase } from '../../helper';
import { HookDto } from '../../../src/features/hook/hook.types';
import { WidgetStatus } from '../../../src/features/widget/widget.types';

test('hook:routes', async (t) => {
  const fastify = await build(t);
  const userRepository = fastify.repository.user;
  const widgetRepository = fastify.repository.widget;

  let created: any;
  let widget: any;

  t.before(async () => {
    await clearDatabase(fastify);

    await userRepository.save({
      id: 'qux',
      email: 'test@user.com',
      role: 'user',
    });

    widget = await widgetRepository.save({
      status: WidgetStatus.PENDING,
      userId: 'qux',
      code: 'code',
    });
  });

  await t.test('should persist hook and link widget', async () => {
    const hookDto: HookDto = {
      name: 'foo',
      domain: 'bar',
      favicon: 'baz',
      userId: 'qux',
      widgetId: widget._id,
    };

    const createResponse = await fastify.inject({
      method: 'POST',
      url: '/api/hooks',
      payload: hookDto,
    });

    assert.equal(createResponse.statusCode, 201);
    created = createResponse.json();

    assert.ok(created.id);
    assert.equal(created.name, hookDto.name);
    assert.equal(created.domain, hookDto.domain);
    assert.equal(created.favicon, hookDto.favicon);
    assert.equal(created.userId, hookDto.userId);
    assert.equal(created.widgetId, hookDto.widgetId);

    const widgetWithHook = await widgetRepository.findByPrimaryId(widget._id);
    assert.equal(widgetWithHook.hookId, created.id);
  });

  // await t.test('should find hook by ID', async () => {
  //   const response = await fastify.inject({
  //     method: 'GET',
  //     url: `/api/hooks/${created.id}`,
  //   });

  //   assert.equal(response.statusCode, 200);
  //   assert.equal(response.json().id, created.id);
  //   assert.equal(response.json().name, created.name);
  //   assert.equal(response.json().domain, created.domain);
  //   assert.equal(response.json().favicon, created.favicon);
  //   assert.equal(response.json().userId, created.userId);
  // });

  // await t.test('should return 404 when trying to create hook with invalid userId', async () => {
  //   const hookDto: HookDto = {
  //     name: 'foo',
  //     domain: 'bar',
  //     favicon: 'baz',
  //     userId: '67b5c2ce1290f60c2eb83e19',
  //     widgetId: 'widgetId',
  //   };

  //   const response = await fastify.inject({
  //     method: 'POST',
  //     url: '/api/hooks',
  //     payload: hookDto,
  //   });

  //   assert.equal(response.statusCode, 404);
  //   assert.equal(response.json().error, 'NotFoundError');
  //   assert.equal(response.json().message, 'User not found: 67b5c2ce1290f60c2eb83e19');
  //   assert.equal(response.json().code, 404);
  // });

  // await t.test('should update hook', async () => {
  //   const updatedHook: HookDto = {
  //     id: created.id,
  //     name: 'updated',
  //     domain: 'updated',
  //     favicon: 'updated',
  //     userId: 'updated',
  //     widgetId: 'widgetId',
  //   };

  //   const response = await fastify.inject({
  //     method: 'PUT',
  //     url: '/api/hooks/' + created.id,
  //     payload: updatedHook,
  //   });

  //   assert.equal(response.statusCode, 200);
  //   assert.equal(response.json().id, updatedHook.id);
  //   assert.equal(response.json().name, updatedHook.name);
  //   assert.equal(response.json().domain, updatedHook.domain);
  //   assert.equal(response.json().favicon, updatedHook.favicon);
  //   assert.equal(response.json().userId, created.userId);
  // });

  // await t.test('should return 404 when trying to update hook with invalid ID', async () => {
  //   const updatedHook: HookDto = {
  //     id: '67b5c2ce1290f60c2eb83e19',
  //     name: 'updated',
  //     domain: 'updated',
  //     favicon: 'updated',
  //     userId: 'updated',
  //     widgetId: 'widgetId',
  //   };

  //   const response = await fastify.inject({
  //     method: 'PUT',
  //     url: '/api/hooks/' + updatedHook.id,
  //     payload: updatedHook,
  //   });

  //   assert.equal(response.statusCode, 404);
  //   assert.equal(response.json().error, 'NotFoundError');
  //   assert.equal(response.json().message, 'Hook not found: 67b5c2ce1290f60c2eb83e19');
  //   assert.equal(response.json().code, 404);
  // });

  // await t.test('should query updated npm hooks by userId', async () => {
  //   const response = await fastify.inject({
  //     method: 'GET',
  //     url: '/api/hooks?userId=' + created.userId,
  //   });

  //   assert.equal(response.statusCode, 200);
  //   assert.equal(response.json().length, 1);
  //   assert.equal(response.json()[0].id, created.id);
  //   assert.equal(response.json()[0].userId, created.userId);
  //   assert.equal(response.json()[0].name, 'updated');
  //   assert.equal(response.json()[0].domain, 'updated');
  //   assert.equal(response.json()[0].favicon, 'updated');
  // });
});
