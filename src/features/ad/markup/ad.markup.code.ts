import FingerprintJS, { GetResult } from '../../fingerprint/fp.script';
import { CaptureTraceDto } from '../../trace';
import { AdMarkupConfig, AdMarkupBlueprint, ImpressionEvent, ImpressionType } from '../ad.types';

export async function load(
  markupConfig: AdMarkupConfig,
  markupRequest: AdMarkupBlueprint,
): Promise<void> {
  const fingerprint = await calculateFingerprint();
  const traceId = crypto.randomUUID();

  try {
    const trace: CaptureTraceDto = {
      traceId: traceId,
      fingerprint: {
        fingerprintId: fingerprint.visitorId,
      },
      page: {
        domain: window.location.hostname,
        path: window.location.pathname,
        search: window.location.search,
        title: document.title,
        referer: document.referrer,
      },
    };

    await sendTrace(markupConfig.traceApiUrl, trace);
  } catch (error) {
    console.error('Failed to send trace:', error);
  }

  try {
    const renderedImpression: ImpressionEvent = {
      type: ImpressionType.RENDERED,
      traceId: traceId,
      fingerprintId: fingerprint.visitorId,
      publisherId: markupRequest.publisherId,
      campaignId: markupRequest.campaignId,
      advertiserId: markupRequest.advertiserId,
      creativeId: markupRequest.creativeId,
    };

    trackImpression(markupConfig.impressionApiUrl, renderedImpression);
  } catch (error) {
    console.error('Failed to send impression:', error);
  }

  const container = document.getElementById(markupRequest.targetId);
  if (!container) {
    console.error('Ad container not found:', markupRequest.targetId);
    return;
  }

  const creative = new Image();
  creative.src = markupRequest.creativeUrl;
  creative.style.width = '100%';

  const adFrame = document.createElement('div');
  adFrame.appendChild(creative);

  // Add custom content based on URL
  const content = document.createElement('div');
  content.textContent = 'Calculated fingerprintId: ' + fingerprint.visitorId;
  adFrame.appendChild(content);

  container.appendChild(adFrame);
  container.onclick = () => {
    console.log('Ad clicked:', fingerprint.visitorId);
  };
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

function trackImpression(impressionApiUrl: string, impression: ImpressionEvent): void {
  const params = new URLSearchParams(toRecord(impression));
  const impressionUrl = impressionApiUrl + '?' + params.toString();

  console.log('Sending impression:', impressionUrl);

  const img = new Image();
  img.src = impressionUrl;
  img.style.display = 'none';
  document.body.appendChild(img);
}

function toRecord<T extends object>(data: T): Record<string, any> {
  return { ...data };
}
