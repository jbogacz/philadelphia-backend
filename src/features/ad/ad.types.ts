export interface AdMarkupRequest {
  publisherId: string;
  targetId: string;
  advertiserId: string;
  creativeId: string;
  campaignId: string;
}

export enum ImpressionType {
  RENDERED = 'rendered', // Ad was delivered and rendered on page
  VIEWABLE = 'viewable',
  VIEWED = 'viewed', // Ad was in viewport for >1 second
  CLICK = 'click', // User clicked the ad
  ERROR = 'error', // Ad failed to render or other error
}

interface BaseImpressionData {
  traceId: string;
  fingerprintId: string;
  publisherId: string;
  campaignId?: string;
  advertiserId: string;
  creativeId: string;
  placementId?: string; // Specific location/slot on the page
  viewportSize?: string; // Target container size
  deviceType?: string;
  customParams?: Record<string, string>;
}

export interface ImpressionEvent extends BaseImpressionData {
  type: ImpressionType;
  errorDetails?: string; // For error events
}
