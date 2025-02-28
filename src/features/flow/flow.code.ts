import PhiladelphiaJS, { GetResult } from '../fingerprint/fp.script';
import { FlowBlueprint, FlowConfig, FlowEventDto } from './flow.types';

export async function load(blueprint: FlowBlueprint, config: FlowConfig) {
  const fingerprint = await calculateFingerprint();
  const traceId = crypto.randomUUID();

  console.log('flow.code', 'Fingerprint:', fingerprint);

  try {
    const event: FlowEventDto = {
      traceId: traceId,
      fingerprint: {
        fingerprintId: fingerprint.visitorId,
      },
      publisherId: blueprint.publisherId,
      campaignId: blueprint.campaignId,
      source: blueprint.source,
    };
    await captureFlowEvent(config.apiUrl, event);
  } catch (error) {
    console.error('flow.code', 'Failed to capture flow event:', error);
  }

  if (blueprint.landingPage) {
    window.location.href = blueprint.landingPage;
  } else {
    console.error('flow.code', 'Missing landingPage');
  }
}

async function calculateFingerprint(): Promise<GetResult> {
  const fp = await PhiladelphiaJS.load();
  return fp.get();
}

async function captureFlowEvent(apiUrl: string, flowEvent: FlowEventDto): Promise<void> {
  console.log('flow.code', 'Capturing flow event:', flowEvent);
  const result = await fetch(apiUrl + '/flow', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(flowEvent),
  });
  if (!result.ok) {
    throw new Error(`Failed to capture flow event: ${result.status} ${result.statusText}`);
  }
}
