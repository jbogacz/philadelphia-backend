import FingerprintJS, { GetResult } from '../../fingerprint/fp.script';
import { FlowBlueprint, FlowConfig } from './flow.types';

export async function load(blueprint: FlowBlueprint, config: FlowConfig) {
  const fingerprint = await calculateFingerprint();

  console.log('Calculated finterprint:', fingerprint.visitorId);

  window.location.href = 'http://localhost:3000/documentation';
}

async function calculateFingerprint(): Promise<GetResult> {
  const fp = await FingerprintJS.load();
  return fp.get();
}
