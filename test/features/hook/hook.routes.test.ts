import * as assert from 'node:assert';
import { test } from 'node:test';
import { build, clearDatabase } from '../../helper';
import { HookDto, HookUpdateDto } from '../../../src/features/hook/hook.types';
import { WidgetDto, WidgetStatus } from '../../../src/features/widget/widget.types';
import { ObjectId } from '@fastify/mongodb';

test('hook:routes', async (t) => {
  const fastify = await build(t);
  const userRepository = fastify.repository.user;
  const widgetRepository = fastify.repository.widget;

  let created: HookDto;
  let widget: WidgetDto;

  t.before(async () => {
    await clearDatabase(fastify);

    await userRepository.save({
      userId: 'qux',
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
      widgetId: widget._id as string,
      description: 'baz',
    };

    const createResponse = await fastify.inject({
      method: 'POST',
      url: '/api/hooks',
      payload: hookDto,
      headers: {
        'x-user-id': 'qux',
      },
    });

    assert.equal(createResponse.statusCode, 201);
    created = createResponse.json();

    assert.ok(created._id);
    assert.equal(created.name, hookDto.name);
    assert.equal(created.domain, hookDto.domain);
    assert.equal(created.favicon, hookDto.favicon);
    assert.equal(created.userId, hookDto.userId);
    assert.equal(created.widgetId, hookDto.widgetId);
    assert.equal(created.description, hookDto.description);
  });

  await t.test('should find hook by ID', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: `/api/hooks/${created._id}`,
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.json()._id, created._id);
    assert.equal(response.json().name, created.name);
    assert.equal(response.json().domain, created.domain);
    assert.equal(response.json().favicon, created.favicon);
    assert.equal(response.json().userId, created.userId);
    assert.equal(response.json().description, created.description);
  });

  await t.test('should link hook with widget', async () => {
    const widgetWithHook = await widgetRepository.findById(widget._id);
    assert.equal(widgetWithHook.hookId, created._id);

    // hook.widgetId is stored as ObjectId
    const hookDb = await fastify.mongo.db.collection('hooks').findOne({ _id: new ObjectId(created._id) });
    assert.ok(hookDb.widgetId instanceof ObjectId);
    assert.ok(hookDb.widgetId.equals(new ObjectId(widget._id)));
  });

  await t.test('should return 404 when trying to create hook with invalid userId', async () => {
    const hookDto: HookDto = {
      name: 'foo',
      domain: 'bar',
      favicon: 'baz',
      userId: '67b5c2ce1290f60c2eb83e19',
      widgetId: widget._id as string,
    };

    const response = await fastify.inject({
      method: 'POST',
      url: '/api/hooks',
      payload: hookDto,
      headers: {
        'x-user-id': '67b5c2ce1290f60c2eb83e19',
      },
    });

    assert.equal(response.statusCode, 404);
    assert.equal(response.json().error, 'NotFoundError');
    assert.equal(response.json().message, 'User not found: 67b5c2ce1290f60c2eb83e19');
    assert.equal(response.json().code, 404);
  });

  await t.test('should update hook', async () => {
    const updatedHook: HookDto = {
      name: 'updated',
      domain: 'updated',
      favicon: 'updated',
      userId: '67b5c2ce1290f60c2eb83e19',
      widgetId: widget._id as string,
    };

    const response = await fastify.inject({
      method: 'PUT',
      url: '/api/hooks/' + created._id,
      payload: updatedHook,
      headers: {
        'x-user-id': '67b5c2ce1290f60c2eb83e19',
      },
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.json().name, updatedHook.name);
    assert.equal(response.json().domain, updatedHook.domain);
    assert.equal(response.json().favicon, updatedHook.favicon);
    assert.equal(response.json().userId, created.userId);
  });

  await t.test('should return 404 when trying to update hook with invalid ID', async () => {
    const updatedHook: HookDto = {
      _id: '67b5c2ce1290f60c2eb83e19',
      name: 'updated',
      domain: 'updated',
      favicon: 'updated',
      userId: 'updated',
      widgetId: 'widgetId',
    };

    const response = await fastify.inject({
      method: 'PUT',
      url: '/api/hooks/' + updatedHook._id,
      payload: updatedHook,
    });

    assert.equal(response.statusCode, 404);
    assert.equal(response.json().error, 'NotFoundError');
    assert.equal(response.json().message, 'Hook not found: 67b5c2ce1290f60c2eb83e19');
    assert.equal(response.json().code, 404);
  });

  await t.test('should query updated hooks by userId', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/hooks?userId=' + created.userId,
      headers: {
        'x-user-id': created.userId,
      },
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.json().length, 1);
    assert.equal(response.json()[0]._id, created._id);
    assert.equal(response.json()[0].userId, created.userId);
    assert.equal(response.json()[0].name, 'updated');
    assert.equal(response.json()[0].domain, 'updated');
    assert.equal(response.json()[0].favicon, 'updated');
  });

  await t.test('should update description', async () => {
    const updatedHook: HookUpdateDto = {
      description: 'qux',
    };

    await fastify.inject({
      method: 'PUT',
      url: '/api/hooks/' + created._id,
      payload: updatedHook,
    });
    const updated = await fastify.repository.hook.findById(created._id?.toString());
    assert.equal(updated?.description, 'qux');
  });

  await t.test('should delete hook and update widget status', async () => {
    const response = await fastify.inject({
      method: 'DELETE',
      url: '/api/hooks/' + created._id,
    });

    assert.equal(response.statusCode, 204);

    const deleted = await fastify.repository.hook.findById(created._id);
    assert.equal(deleted, null);

    const widgetWithDeletedHook = await widgetRepository.findById(widget._id);
    assert.equal(widgetWithDeletedHook.hookId, created._id);
    assert.equal(widgetWithDeletedHook.status, WidgetStatus.DELETED);
  });
});
