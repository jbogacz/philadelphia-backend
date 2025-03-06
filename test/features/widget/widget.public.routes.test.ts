import * as assert from 'node:assert';
import { test } from 'node:test';
import { build, clearDatabase } from '../../helper';
import { Widget, WidgetStatus } from '../../../src/features/widget/widget.types';
import { randomUUID } from 'node:crypto';
import { Partnership } from '../../../src/features/partnership/partnership.types';

test('widget:public:routes', async (t) => {
  const fastify = await build(t);

  let widget: Widget;
  let inactiveWidget: Widget;
  let deletedWidget: Widget;

  t.before(async () => {
    await clearDatabase(fastify);

    widget = await fastify.repository.widget.save({
      widgetKey: 'widget-key-1',
      userId: 'user-id-1',
      status: WidgetStatus.REGISTERED,
      code: '<script></script>',
    });

    inactiveWidget = await fastify.repository.widget.save({
      widgetKey: 'widget-key-2',
      userId: 'user-id-2',
      status: WidgetStatus.INACTIVE,
      code: '<script></script>',
    });

    deletedWidget = await fastify.repository.widget.save({
      widgetKey: 'widget-key',
      userId: 'user-id-2',
      status: WidgetStatus.DELETED,
      code: '<script></script>',
    });
  });

  t.before(async () => {
    await clearDatabase(fastify);
  });

  await t.test('should not generate widget code if passed wrong widgetKey', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/public/widgets',
      query: {
        widgetKey: 'bar',
      },
    });

    assert.equal(response.statusCode, 400);
  });

  await t.test('should not generate widget code if widget is inactive', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/public/widgets',
      query: {
        widgetKey: inactiveWidget.widgetKey,
      },
    });
    assert.equal(response.statusCode, 400);
  });

  await t.test('should generate widget without partners panel', async () => {
    const partnership: Partnership = await fastify.repository.partnership.save({
      sourceWidgetKey: widget.widgetKey,
      widgetKey: randomUUID().toString(),
      pageName: 'TechPartner Solutions',
      pageUrl: 'https://techpartner.example.com',
      pageDescription: 'TechPartner Solutions is a leading technology company that provides in…',
    });

    const response = await fastify.inject({
      method: 'GET',
      url: '/api/public/widgets',
      query: {
        widgetKey: widget.widgetKey,
      },
    });

    assert.equal(response.statusCode, 200);
    assert.ok(response.payload);
    assert.ok(response.payload.includes(partnership.sourceWidgetKey));
    assert.ok(response.payload.includes(partnership.widgetKey));
    assert.ok(response.payload.includes(partnership.pageName));
    assert.ok(response.payload.includes(partnership.pageUrl));
    assert.ok(response.payload.includes(partnership.pageDescription));
  });
});
