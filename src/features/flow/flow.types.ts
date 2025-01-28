import { DynamicBlueprint, DynamicConfig } from '../../dynamic/types';

export enum FlowSource {
  INSTAGRAM = 'instagram',
  UNKNOWN = 'unknown',
}

export const valueOfSource = (value: string): FlowSource => {
  return Object.values(FlowSource).includes(value as FlowSource)
    ? (value as FlowSource)
    : FlowSource.UNKNOWN;
};

/**
 * MODEL
 */
export interface FlowBlueprint extends DynamicBlueprint {
  publisherId: string;
  campaignId: string;

  source: FlowSource;
}

export interface FlowConfig extends DynamicConfig {
  traceApiUrl: string;
  flowApiUrl: string;
}

/**
 * DTO
 */
export type FlowDto = {
  utmCampaign: string;
  utmSource: string;
  utmContent: string;
};

export type FlowEventDto = {
  traceId: string;
  fingerprint: {
    fingerprintId: string;
  }
  publisherId: string;
  campaignId: string;
  source: FlowSource;
  referer: string;
};
