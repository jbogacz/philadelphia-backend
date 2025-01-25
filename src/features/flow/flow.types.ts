import { DynamicBlueprint, DynamicConfig } from "../../dynamic/types";

/**
 * MODEL
 */
export interface FlowBlueprint extends DynamicBlueprint {
  publisherId: string,
  campaignId: string,

  source: string,
  referer: string
}

export interface FlowConfig extends DynamicConfig{

}

/**
 * DTO
 */
export type FlowDto = {
  utmCampaign: string;
  utmSource: string;
  utmContent: string;
};
