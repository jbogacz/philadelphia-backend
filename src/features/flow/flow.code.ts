import FingerprintJS, { GetResult } from '../fingerprint/fp.script';
import { FlowBlueprint, FlowConfig } from './flow.types';

export async function load(blueprint: FlowBlueprint, config: FlowConfig) {
  const fingerprint = await calculateFingerprint();
  const traceId = crypto.randomUUID();

  // TODO: Collect publisherId, campaignId, source

  window.location.href = 'https://en.wikipedia.org/wiki/Philadelphia';
}

async function calculateFingerprint(): Promise<GetResult> {
  const fp = await FingerprintJS.load();
  return fp.get();
}
