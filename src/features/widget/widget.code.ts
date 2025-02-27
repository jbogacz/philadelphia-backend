import PhiladelphiaJS, { GetResult } from '../fingerprint/fp.script';
import { WidgetCodeBlueprint, WidgetCodeConfig } from './widget.types';

export async function load(blueprint: WidgetCodeBlueprint, config: WidgetCodeConfig) {
  const fingerprint = await calculateFingerprint();
  const traceId = crypto.randomUUID();

  console.log('widget.code', 'Fingerprint:', fingerprint.visitorId);
  console.log('widget.code', 'TraceId:', traceId);
}

async function calculateFingerprint(): Promise<GetResult> {
  const fp = await PhiladelphiaJS.load();
  return fp.get();
}
