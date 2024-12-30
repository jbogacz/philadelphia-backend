import FingerprintJS, { GetResult } from '../../fingerprint/fp.script';
import { CaptureTraceDto } from '../../trace';
import { AdRequest, ImpressionEvent, ImpressionType } from '../ad.types';

export async function initialize(backendUrl: string, adRequest: AdRequest): Promise<void> {
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

    await sendTrace(trace);
  } catch (error) {
    console.error('Failed to send trace:', error);
  }

  try {
    const impression: ImpressionEvent = {
      traceId: traceId,
      fingerprintId: fingerprint.visitorId,
      publisherId: adRequest.publisherId,
      advertiserId: adRequest.advertiserId,
      creativeId: adRequest.creativeId,
      type: ImpressionType.RENDERED,
    };
    const renderedImpression = buildImpression(backendUrl, impression);
    document.body.appendChild(renderedImpression);
  } catch (error) {
    console.error('Failed to send impression:', error);
  }

  const container = document.getElementById('ad-container');
  if (!container) {
    console.error('Ad container not found:', 'ad-container');
    return;
  }

  const adFrame = document.createElement('div');
  adFrame.style.width = '100%';
  adFrame.style.height = '250px';
  adFrame.style.border = '1px solid #ccc';

  // Add custom content based on URL
  const content = document.createElement('div');
  content.textContent = 'Calculated fingerprintId: ' + fingerprint.visitorId;
  adFrame.appendChild(content);

  container.appendChild(adFrame);
  container.onclick = () => {
    console.log('Ad clicked:', fingerprint.visitorId);
  };

  // const impression = impressionPixel(fingerprint.visitorId);
  // container.appendChild(impression);
}

async function calculateFingerprint(): Promise<GetResult> {
  const fp = await FingerprintJS.load();
  return fp.get();
}

async function sendTrace(trace: CaptureTraceDto): Promise<void> {
  console.log('Sending trace:', trace);
  const result = await fetch('http://localhost:3000/api/traces', {
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

function buildImpression(backendUrl: string, impression: ImpressionEvent): HTMLElement {
  const params = new URLSearchParams(toRecord(impression));
  const impressionUrl = backendUrl + '/api/impression?' + params.toString();

  console.log('Sending impression:', impressionUrl);

  const img = new Image();
  img.src = impressionUrl;
  img.style.display = 'none';
  return img;
}

function toRecord<T extends object>(data: T): Record<string, any> {
  return { ...data };
}
