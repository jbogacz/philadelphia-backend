import * as assert from 'node:assert';
import { test } from 'node:test';
import { build, clearDatabase } from '../../helper';
import { ObjectId } from '@fastify/mongodb';
import { randomUUID } from 'node:crypto';
import { TraceType } from '../../../src/features/trace/trace.types';
import { InsightsOverviewDto } from '../../../src/features/insight/insight.type';
import { subDays } from 'date-fns/subDays';
import { Hook } from '../../../src/features/hook/hook.types';
import { Widget, WidgetStatus } from '../../../src/features/widget/widget.types';

test('insight:routes', async (t) => {
  const fastify = await build(t);

  t.beforeEach(async () => {
    await clearDatabase(fastify);
  });

  await t.test('should return all visits', async () => {
    const fingerprintId1 = randomUUID().toString();
    const fingerprintId2 = randomUUID().toString();
    const fingerprintId3 = randomUUID().toString();
    const fingerprintId4 = randomUUID().toString();
    const fingerprintId5 = randomUUID().toString();

    const now = new Date();

    await saveTrace(TraceType.VISIT, fingerprintId1, subDays(now, 5));
    await saveTrace(TraceType.VISIT, fingerprintId1, subDays(now, 5));
    await saveTrace(TraceType.VISIT, randomUUID().toString(), subDays(now, 5));
    await saveTrace(TraceType.VISIT, randomUUID().toString(), subDays(now, 5));
    await saveTrace(TraceType.VISIT, randomUUID().toString(), subDays(now, 5));

    await saveTrace(TraceType.VISIT, fingerprintId2, subDays(now, 3));
    await saveTrace(TraceType.VISIT, fingerprintId2, subDays(now, 3));
    await saveTrace(TraceType.VISIT, randomUUID().toString(), subDays(now, 3));
    await saveTrace(TraceType.VISIT, randomUUID().toString(), subDays(now, 3));

    await saveTrace(TraceType.VISIT, fingerprintId3, subDays(now, 2));
    await saveTrace(TraceType.VISIT, fingerprintId3, subDays(now, 2));
    await saveTrace(TraceType.VISIT, randomUUID().toString(), subDays(now, 2));
    await saveTrace(TraceType.VISIT, randomUUID().toString(), subDays(now, 2));
    await saveTrace(TraceType.VISIT, randomUUID().toString(), subDays(now, 2));
    await saveTrace(TraceType.VISIT, randomUUID().toString(), subDays(now, 2));
    await saveTrace(TraceType.VISIT, randomUUID().toString(), subDays(now, 2));

    await saveTrace(TraceType.VISIT, fingerprintId4, subDays(now, 1));
    await saveTrace(TraceType.VISIT, fingerprintId4, subDays(now, 1));
    await saveTrace(TraceType.VISIT, randomUUID().toString(), subDays(now, 1));
    await saveTrace(TraceType.VISIT, randomUUID().toString(), subDays(now, 1));

    await saveTrace(TraceType.VISIT, fingerprintId5, now);
    await saveTrace(TraceType.VISIT, fingerprintId5, now);
    await saveTrace(TraceType.VISIT, randomUUID().toString(), now);
    await saveTrace(TraceType.VISIT, randomUUID().toString(), now);

    const response = await fastify.inject({
      method: 'GET',
      url: '/api/insights',
      query: {
        hookId: '67c31b8a3478e7376e61a622',
      },
    });

    assert.equal(response.statusCode, 200);

    const insightsOverview = JSON.parse(response.body) as InsightsOverviewDto;
    assert.equal(insightsOverview.summary.direct.visits, 24);
    assert.equal(insightsOverview.summary.direct.uniqueVisitors, 19);
    assert.equal(insightsOverview.summary.direct.visitsChange, 0);
    assert.equal(insightsOverview.summary.direct.uniqueVisitorsChange, 0);

    assert.equal(insightsOverview.daily.direct.length, 14);
    assert.equal(insightsOverview.daily.direct[0].date, subDays(now, 13).toISOString().substring(0, 10));
    assert.equal(insightsOverview.daily.direct[13].date, now.toISOString().substring(0, 10));
    assert.equal(insightsOverview.daily.direct[8].visits, 5);
    assert.equal(insightsOverview.daily.direct[8].uniqueVisitors, 4);
    assert.equal(insightsOverview.daily.direct[9].visits, 0);
    assert.equal(insightsOverview.daily.direct[9].uniqueVisitors, 0);
    assert.equal(insightsOverview.daily.direct[10].visits, 4);
    assert.equal(insightsOverview.daily.direct[10].uniqueVisitors, 3);
    assert.equal(insightsOverview.daily.direct[11].visits, 7);
    assert.equal(insightsOverview.daily.direct[11].uniqueVisitors, 6);
    assert.equal(insightsOverview.daily.direct[12].visits, 4);
    assert.equal(insightsOverview.daily.direct[12].uniqueVisitors, 3);
    assert.equal(insightsOverview.daily.direct[13].visits, 4);
    assert.equal(insightsOverview.daily.direct[13].uniqueVisitors, 3);
  });

  await t.test('should return direct and partner visits for specific date range', async () => {
    const fingerprintId1 = randomUUID().toString();
    await saveTrace(TraceType.VISIT, randomUUID().toString(), new Date('2025-03-01'));
    await saveTrace(TraceType.VISIT, randomUUID().toString(), new Date('2025-03-02'));
    await saveTrace(TraceType.VISIT, randomUUID().toString(), new Date('2025-03-03'));
    await saveTrace(TraceType.WIDGET, fingerprintId1, new Date('2025-03-03'));
    await saveTrace(TraceType.WIDGET, fingerprintId1, new Date('2025-03-03'));
    await saveTrace(TraceType.VISIT, randomUUID().toString(), new Date('2025-03-04'));
    await saveTrace(TraceType.VISIT, randomUUID().toString(), new Date('2025-03-05'));

    const response = await fastify.inject({
      method: 'GET',
      url: '/api/insights',
      query: {
        hookId: '67c31b8a3478e7376e61a622',
        startDate: '2025-03-02',
        endDate: '2025-03-04',
      },
    });

    const insightsOverview = JSON.parse(response.body) as InsightsOverviewDto;
    assert.equal(insightsOverview.summary.direct.visits, 3);
    assert.equal(insightsOverview.summary.direct.uniqueVisitors, 3);
    assert.equal(insightsOverview.summary.direct.visitsChange, 200);
    assert.equal(insightsOverview.summary.direct.uniqueVisitorsChange, 200);
    assert.equal(insightsOverview.daily.direct.length, 3);
    assert.equal(insightsOverview.summary.partner.visits, 2);
    assert.equal(insightsOverview.summary.partner.uniqueVisitors, 1);
    assert.equal(insightsOverview.summary.partner.visitsChange, 0);
    assert.equal(insightsOverview.summary.partner.uniqueVisitorsChange, 0);
    assert.equal(insightsOverview.daily.partner.length, 3);
  });

  await t.test('should calculate percentage change against previous same period', async () => {
    const now = new Date();

    await saveTrace(TraceType.VISIT, randomUUID().toString(), now);
    await saveTrace(TraceType.VISIT, randomUUID().toString(), now);
    await saveTrace(TraceType.VISIT, randomUUID().toString(), now);
    await saveTrace(TraceType.VISIT, randomUUID().toString(), now);
    await saveTrace(TraceType.VISIT, randomUUID().toString(), now);
    await saveTrace(TraceType.VISIT, randomUUID().toString(), subDays(now, 14));
    await saveTrace(TraceType.VISIT, randomUUID().toString(), subDays(now, 14));
    await saveTrace(TraceType.VISIT, randomUUID().toString(), subDays(now, 14));
    await saveTrace(TraceType.VISIT, randomUUID().toString(), subDays(now, 14));
    await saveTrace(TraceType.VISIT, randomUUID().toString(), subDays(now, 14));
    await saveTrace(TraceType.VISIT, randomUUID().toString(), subDays(now, 14));
    await saveTrace(TraceType.VISIT, randomUUID().toString(), subDays(now, 14));
    await saveTrace(TraceType.VISIT, randomUUID().toString(), subDays(now, 14));
    await saveTrace(TraceType.VISIT, randomUUID().toString(), subDays(now, 14));
    await saveTrace(TraceType.VISIT, randomUUID().toString(), subDays(now, 14));
    await saveTrace(TraceType.VISIT, randomUUID().toString(), subDays(now, 14));

    const response = await fastify.inject({
      method: 'GET',
      url: '/api/insights',
      query: {
        hookId: '67c31b8a3478e7376e61a622',
      },
    });

    const insightsOverview = JSON.parse(response.body) as InsightsOverviewDto;
    assert.equal(insightsOverview.summary.direct.visits, 5);
    assert.equal(insightsOverview.summary.direct.uniqueVisitors, 5);
    assert.equal(insightsOverview.summary.direct.visitsChange, -55);
    assert.equal(insightsOverview.summary.direct.uniqueVisitorsChange, -55);
  });

  await t.test('should calculate percentage partner distribution', async () => {
    const { hookId: targetHookId } = await saveHookAndWidget('Target Hook');
    const { hookId: sourceHookId1 } = await saveHookAndWidget('Source Hook 1');
    const { hookId: sourceHookId2 } = await saveHookAndWidget('Source Hook 2');
    const { hookId: sourceHookId3 } = await saveHookAndWidget('Source Hook 3');

    const now = new Date();
    await saveWidgetTrace(sourceHookId1, targetHookId, subDays(now, 5));
    await saveWidgetTrace(sourceHookId1, targetHookId, subDays(now, 5));
    await saveWidgetTrace(sourceHookId1, targetHookId, subDays(now, 5));
    await saveWidgetTrace(sourceHookId1, targetHookId, subDays(now, 5));
    await saveWidgetTrace(sourceHookId1, targetHookId, subDays(now, 5));
    await saveWidgetTrace(sourceHookId2, targetHookId, subDays(now, 3));
    await saveWidgetTrace(sourceHookId2, targetHookId, subDays(now, 3));
    await saveWidgetTrace(sourceHookId2, targetHookId, subDays(now, 3));
    await saveWidgetTrace(sourceHookId3, targetHookId, subDays(now, 2));
    await saveWidgetTrace(sourceHookId3, targetHookId, subDays(now, 2));

    const response = await fastify.inject({
      method: 'GET',
      url: '/api/insights',
      query: {
        hookId: targetHookId.toString(),
      },
    });
    assert.equal(response.statusCode, 200);

    const insightsOverview = JSON.parse(response.body) as InsightsOverviewDto;
    assert.equal(insightsOverview.summary.partner.visits, 10);
    assert.equal(insightsOverview.summary.partner.uniqueVisitors, 10);
    assert.equal(insightsOverview.summary.partner.distribution.length, 3);
    assert.equal(insightsOverview.summary.partner.distribution[0].name, 'Source Hook 1');
    assert.equal(insightsOverview.summary.partner.distribution[0].visits, 5);
    assert.equal(insightsOverview.summary.partner.distribution[1].name, 'Source Hook 2');
    assert.equal(insightsOverview.summary.partner.distribution[1].visits, 3);
    assert.equal(insightsOverview.summary.partner.distribution[2].name, 'Source Hook 3');
    assert.equal(insightsOverview.summary.partner.distribution[2].visits, 2);
  });

  function saveTrace(type: string, fingerprintId: string, date: Date) {
    const trace = {
      createdAt: date,
      updatedAt: date,
      hookId: new ObjectId('67c31b8a3478e7376e61a622'),
      type: type,
      fingerprint: {
        fingerprintId: fingerprintId,
      },
      traceId: randomUUID().toString(),
      widgetId: randomUUID().toString(),
      widgetKey: randomUUID().toString(),
    };
    return fastify.mongo.db?.collection('traces').insertOne(trace);
  }

  function saveWidgetTrace(sourceHookId: ObjectId, hookId: ObjectId, date: Date) {
    const trace = {
      createdAt: date,
      updatedAt: date,
      hookId: hookId,
      sourceHookId: sourceHookId,
      type: TraceType.WIDGET,
      fingerprint: {
        fingerprintId: randomUUID().toString(),
      },
      traceId: randomUUID().toString(),
    };
    return fastify.mongo.db?.collection('traces').insertOne(trace);
  }

  async function saveHookAndWidget(name: string): Promise<{ hookId: ObjectId; widgetId: ObjectId }> {
    const noSpacesName = name.replace(/\s/g, '');
    const widget: Widget = {
      status: WidgetStatus.ACTIVE,
      userId: 'userId-' + noSpacesName,
      widgetKey: 'widgetKey-' + noSpacesName,
      code: 'code-' + noSpacesName,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const dbWidget = await fastify.mongo.db?.collection('widgets').insertOne(widget);
    const hook: Hook = {
      name: name,
      domain: 'domain',
      favicon: 'favicon',
      userId: 'userId-' + noSpacesName,
      widgetId: dbWidget?.insertedId as string,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const dbHook = await fastify.mongo.db?.collection('hooks').insertOne(hook);
    return {
      hookId: dbHook.insertedId,
      widgetId: dbWidget.insertedId,
    };
  }
});
