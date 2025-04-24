import { test } from 'node:test';
import * as assert from 'node:assert';
import { build, clearDatabase } from '../../helper';
import { TraceRepository } from '../../../src/features/trace/trace.repository';
import { VisitTrace, VisitTraceDto, WidgetTrace, WidgetTraceDto } from '../../../src/features/trace/trace.types';
import { Widget, WidgetStatus } from '../../../src/features/widget/widget.types';
import { Hook, HookCategory, HookStatus } from '../../../src/features/hook/hook.types';
import { randomUUID } from 'node:crypto';

test('trace:public:routes', async (t) => {
  const fastify = await build(t);
  const traceRepository: TraceRepository = fastify.repository.trace;
  const widgetRepository = fastify.repository.widget;
  const hookRepository = fastify.repository.hook;

  let hook: Hook;
  let widget: Widget;
  let sourceHook: Hook;
  let sourceWidget: Widget;

  t.before(async () => {
    await clearDatabase(fastify);

    widget = await widgetRepository.save({
      widgetKey: 'widget-key-1',
      userId: 'user-id-1',
      status: WidgetStatus.REGISTERED,
      code: '<script></script>',
    });

    hook = await hookRepository.save({
      category: HookCategory.BLOG,
      name: 'hook-name-1',
      status: HookStatus.REGISTERED,
      userId: 'user-id-1',
      widgetId: widget._id?.toString(),
    } as Hook);

    await widgetRepository.update(widget._id!, { hookId: hook._id! } as Widget);

    sourceWidget = await widgetRepository.save({
      widgetKey: 'widget-key-2',
      userId: 'user-id-2',
      status: WidgetStatus.ACTIVE,
      code: '<script></script>',
    });

    sourceHook = await hookRepository.save({
      category: HookCategory.BLOG,
      name: 'hook-name-2',
      status: HookStatus.ACTIVE,
      userId: 'user-id-2',
      widgetId: sourceWidget._id?.toString(),
    } as Hook);

    await widgetRepository.update(sourceWidget._id!, { hookId: sourceHook._id! } as Widget);
  });

  await t.test('should capture visit trace', async () => {
    const trace: VisitTraceDto = {
      traceId: randomUUID().toString(),
      fingerprint: {
        fingerprintId: 'fingerprint-id-1',
      },
      widgetKey: widget.widgetKey,
      page: {
        domain: 'https://example.com',
        path: '/path',
        search: '/search',
        referer: 'https://example.com',
      },
    };

    const response = await fastify.inject({
      method: 'POST',
      url: '/api/public/traces/visits',
      body: trace,
    });

    assert.equal(response.statusCode, 201);

    const traces = await traceRepository.query({ traceId: trace.traceId });
    assert.equal(traces.length, 1);

    const dbTrace = traces[0] as VisitTrace;
    assert.equal(dbTrace.traceId, trace.traceId);
    assert.equal(dbTrace.type, 'visit');
    assert.equal(dbTrace.fingerprint.fingerprintId, trace.fingerprint.fingerprintId);
    assert.equal(dbTrace.widgetKey, trace.widgetKey);
    assert.equal(dbTrace.widgetId, widget._id?.toString());
    assert.equal(dbTrace.hookId, hook._id?.toString());
    assert.equal(dbTrace.page.domain, trace.page.domain);
    assert.equal(dbTrace.page.path, trace.page.path);
    assert.equal(dbTrace.page.search, trace.page.search);
    assert.equal(dbTrace.page.referer, trace.page.referer);
  });

  await t.test('should activate widget and hook if pending', async () => {
    const dbWidget: Widget = await widgetRepository.findById(widget._id!);
    assert.equal(dbWidget?.status, WidgetStatus.ACTIVE);

    const dbHook: Hook = await hookRepository.findById(hook._id!);
    assert.equal(dbHook?.status, HookStatus.ACTIVE);
    assert.equal(dbHook?.domain, 'https://example.com');
  });

  await t.test('should skip visit trace if invalid widgetKey', async () => {
    const trace: VisitTraceDto = {
      traceId: randomUUID().toString(),
      fingerprint: {
        fingerprintId: 'fingerprint-id-2',
      },
      widgetKey: 'invalid',
      page: {
        domain: 'string',
        path: 'string',
        search: 'string',
        referer: 'string',
      },
    };

    const response = await fastify.inject({
      method: 'POST',
      url: '/api/public/traces/visits',
      body: trace,
    });

    assert.equal(response.statusCode, 201);

    const traces = await traceRepository.query({ traceId: trace.traceId });
    assert.equal(traces.length, 0);
  });

  await t.test('should skip visit trace if widget is inactive', async () => {
    await widgetRepository.update(widget._id!, { status: WidgetStatus.INACTIVE } as Widget);
    const trace: VisitTraceDto = {
      traceId: randomUUID().toString(),
      fingerprint: {
        fingerprintId: 'fingerprint-id-1',
      },
      widgetKey: widget.widgetKey,
      page: {
        domain: 'https://example.com',
        path: '/path',
        search: '/search',
        referer: 'https://example.com',
      },
    };
    const response = await fastify.inject({
      method: 'POST',
      url: '/api/public/traces/visits',
      body: trace,
    });

    assert.equal(response.statusCode, 201);

    const traces = await traceRepository.query({ traceId: trace.traceId });
    assert.equal(traces.length, 0);

    await widgetRepository.update(widget._id!, { status: WidgetStatus.ACTIVE } as Widget);
  });

  await t.test('should capture widget trace', async () => {
    const trace: WidgetTraceDto = {
      traceId: randomUUID().toString(),
      fingerprint: {
        fingerprintId: randomUUID().toString(),
      },
      widgetKey: widget.widgetKey,
      sourceWidgetKey: sourceWidget.widgetKey,
    };

    const response = await fastify.inject({
      method: 'POST',
      url: '/api/public/traces/widgets',
      body: trace,
    });

    assert.equal(response.statusCode, 201);

    const dbTrace = await traceRepository.queryOne({ traceId: trace.traceId }) as WidgetTrace;
    assert.ok(dbTrace);
    assert.equal(dbTrace?.type, 'widget');
    assert.equal(dbTrace?.widgetKey, widget.widgetKey);
    assert.equal(dbTrace?.widgetId, widget._id?.toString());
    assert.equal(dbTrace?.hookId, hook._id?.toString());
    assert.equal(dbTrace?.sourceWidgetKey, sourceWidget.widgetKey);
    assert.equal(dbTrace?.sourceWidgetId, sourceWidget._id?.toString());
    assert.equal(dbTrace?.sourceHookId, sourceHook._id?.toString());
    assert.equal(dbTrace?.fingerprint.fingerprintId, trace.fingerprint.fingerprintId);
  });
});
