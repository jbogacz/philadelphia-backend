import PhiladelphiaJS, { GetResult } from '../fingerprint/fp.script';
import { VisitTraceDto } from '../trace/trace.types';
import { WidgetCodeBlueprint, WidgetCodeConfig } from './widget.types';

export async function load(blueprint: WidgetCodeBlueprint, config: WidgetCodeConfig) {
  const fingerprint = await calculateFingerprint();
  const traceId = crypto.randomUUID();

  const visitTrace: VisitTraceDto = {
    traceId: traceId,
    fingerprint: {
      fingerprintId: fingerprint.visitorId,
    },
    widgetKey: blueprint.widgetKey,
    page: {
      domain: window.location.hostname,
      path: window.location.pathname,
      search: window.location.search,
      referer: document.referrer,
    },
  };
  await sendVisitTrace(config.traceApiUrl, visitTrace);
}

async function calculateFingerprint(): Promise<GetResult> {
  const fp = await PhiladelphiaJS.load();
  return fp.get();
}

async function sendVisitTrace(traceApiUrl: string, trace: VisitTraceDto): Promise<void> {
  try {
    await fetch(traceApiUrl + '/visits', {
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
