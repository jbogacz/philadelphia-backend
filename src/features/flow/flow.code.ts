import FingerprintJS, { GetResult } from '../fingerprint/fp.script';
import { CaptureTraceDto } from '../trace';
import { FlowBlueprint, FlowConfig } from './flow.types';

export async function load(blueprint: FlowBlueprint, config: FlowConfig) {
  const fingerprint = await calculateFingerprint();
  const traceId = crypto.randomUUID();

  try {
    const trace: CaptureTraceDto = {
      traceId: traceId,
      type: 'flow',
      fingerprint: {
        fingerprintId: fingerprint.visitorId,
      },
      page: {
        referer: document.referrer,
      },
    };

    await sendTrace(config.traceApiUrl, trace);
  } catch (error) {
    console.error('Failed to send trace:', error);
  }

  // TODO: Collect publisherId, campaignId, source

  // window.location.href = 'https://en.wikipedia.org/wiki/Philadelphia';
}

async function calculateFingerprint(): Promise<GetResult> {
  const fp = await FingerprintJS.load();
  return fp.get();
}

async function sendTrace(traceApiUrl: string, trace: CaptureTraceDto): Promise<void> {
  console.log('Sending trace:', trace);
  const result = await fetch(traceApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(trace),
  });

  if (!result.ok) {
    throw new Error(`Failed to send trace: ${result.status} ${result.statusText}`);
  }
}
