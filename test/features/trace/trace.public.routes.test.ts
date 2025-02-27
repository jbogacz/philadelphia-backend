import { test } from 'node:test';
import * as assert from 'node:assert';
import { build, clearDatabase } from '../../helper';
import { TraceRepository } from '../../../src/features/trace/trace.repository';
import { VisitTrace, VisitTraceDto } from '../../../src/features/trace/trace.types';
import { Widget } from '../../../src/features/widget/widget.types';

test('trace:public:routes', async (t) => {
  const fastify = await build(t);
  const traceRepository: TraceRepository = fastify.repository.trace;
  const widgetRepository = fastify.repository.widget;

  let widget: Widget;

  t.before(async () => {
    await clearDatabase(fastify);

    widget = await widgetRepository.save({
      widgetKey: 'widget-key-1',
      hookId: 'hook-id-1',
      userId: 'user-id-1',
      status: 'active',
      code: '<script></script>',
    });
  });

  await t.test('should capture visit trace', async () => {
    const trace: VisitTraceDto = {
      traceId: 'trace-id-1',
      fingerprint: {
        fingerprintId: 'fingerprint-id-1',
      },
      widgetKey: 'widget-key-1',
      page: {
        domain: 'string',
        path: 'string',
        search: 'string',
        referer: 'string',
      },
    };

    const response = await fastify.inject({
      method: 'POST',
      url: '/api/public/traces',
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
    assert.equal(dbTrace.hookId, 'hook-id-1');
    assert.equal(dbTrace.page.domain, trace.page.domain);
    assert.equal(dbTrace.page.path, trace.page.path);
    assert.equal(dbTrace.page.search, trace.page.search);
    assert.equal(dbTrace.page.referer, trace.page.referer);
  });

  await t.test('should capture visit trace with missing widget', async () => {
    const trace: VisitTraceDto = {
      traceId: 'trace-id-2',
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
      url: '/api/public/traces',
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
    assert.equal(dbTrace.widgetId, '');
    assert.equal(dbTrace.hookId, '');
    assert.equal(dbTrace.page.domain, trace.page.domain);
    assert.equal(dbTrace.page.path, trace.page.path);
    assert.equal(dbTrace.page.search, trace.page.search);
    assert.equal(dbTrace.page.referer, trace.page.referer);
  });
});
