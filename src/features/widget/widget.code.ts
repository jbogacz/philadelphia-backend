import PhiladelphiaJS from '../fingerprint/fp.script';
import { FingerprintComponents, Geo, VisitTraceDto } from '../trace/trace.types';
import { load as loadPanel } from './widget.panel.code';
import { WidgetCodeBlueprint, WidgetCodeConfig } from './widget.types';

export async function load(blueprint: WidgetCodeBlueprint, config: WidgetCodeConfig) {
  const traceId = crypto.randomUUID();
  const fingerprint = await calculateFingerprint();
  const geolocationData: Geo | null = await fetchGeolocationData();

  const visitTrace: VisitTraceDto = {
    traceId: traceId,
    fingerprint: {
      fingerprintId: fingerprint.fingerprintId,
      components: fingerprint.components,
    },
    widgetKey: blueprint.widgetKey,
    page: {
      domain: window.location.origin,
      path: window.location.pathname,
      search: window.location.search,
      referer: document.referrer,
    },
    geo: geolocationData || undefined,
  };
  await sendVisitTrace(config.apiUrl, visitTrace);

  if (blueprint.showWidgetPanel) {
    await loadPanel(traceId, fingerprint, geolocationData, blueprint, config);
  }
}

async function calculateFingerprint(): Promise<{ fingerprintId: string; components: FingerprintComponents }> {
  const fp = await PhiladelphiaJS.load({ debug: false });
  const result = await fp.get();
  const jsonComponents = JSON.stringify(result.components);
  const components = JSON.parse(jsonComponents) as FingerprintComponents;
  return {
    fingerprintId: result.visitorId,
    components: removeField(components, 'duration'),
  };
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

async function fetchGeolocationData(): Promise<Geo | null> {
  const TIMEOUT_MS = 500;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch('https://api.ipgeolocation.io/ipgeo?apiKey=309b81dc18734773a1860a41f90e4723', {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();
    return (
      data && {
        ip: data.ip,
        city: data.city,
        postal: data.zipcode,
        region: data.state_prov,
        country: data.country_name,
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        timezone: data.time_zone?.name,
        currentTime: data.time_zone?.current_time,
        isp: data.isp,
      }
    );
  } catch (error) {
    return null;
  }
}

function removeField(obj: any, fieldToRemove: string): any {
  if (Array.isArray(obj)) {
    return obj.map((item) => removeField(item, fieldToRemove));
  } else if (typeof obj === 'object' && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([key]) => key !== fieldToRemove)
        .map(([key, value]) => [key, removeField(value, fieldToRemove)])
    );
  }
  return obj;
}
