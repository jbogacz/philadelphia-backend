import PhiladelphiaJS, { GetResult } from '../fingerprint/fp.script';
import { VisitTraceDto } from '../trace/trace.types';
import { loadPanel as loadWidgetPanel } from './widget.code.panel';
import { WidgetCodeBlueprint, WidgetCodeConfig } from './widget.types';

export async function load(blueprint: WidgetCodeBlueprint, config: WidgetCodeConfig) {
  const traceId = crypto.randomUUID();
  const fingerprint = await calculateFingerprint();

  loadWidgetPanel(traceId, fingerprint.visitorId, blueprint, config);

  const visitTrace: VisitTraceDto = {
    traceId: traceId,
    fingerprint: {
      fingerprintId: fingerprint.visitorId,
    },
    widgetKey: blueprint.widgetKey,
    page: {
      domain: window.location.origin,
      path: window.location.pathname,
      search: window.location.search,
      referer: document.referrer,
    },
  };
  await sendVisitTrace(config.apiUrl, visitTrace);
}

async function calculateFingerprint(): Promise<GetResult> {
  const fp = await PhiladelphiaJS.load();
  return fp.get();
}

async function sendVisitTrace(apiUrl: string, trace: VisitTraceDto): Promise<void> {
  try {
    await fetch(apiUrl + '/public/traces/visits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(trace),
    });
  } catch (error) {
    console.error('Failed to send trace:', error);
  }
}
