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
  utmCampaign: string;
  landingPage: string;
  widgetKey: string;
}

export interface FlowConfig extends DynamicConfig {
  apiUrl: string;
}

/**
 * DTO
 */
export type FlowDto = {
  utm_campaign: string;
  utm_source?: string;
  utm_content?: string;
};

export type FlowEventDto = {
  traceId: string;
  fingerprint: {
    fingerprintId: string;
  }
  publisherId: string;
  campaignId: string;
  source: FlowSource;
};
