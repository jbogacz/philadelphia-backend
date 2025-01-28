import { Static, Type } from '@sinclair/typebox';
import { BaseSchema, IEntity } from '../base.repository';

export enum CampaignStatus {
  ACTIVE = 'active',
}

/**
 * SCHEMA
 */
export const CampaignTraceSchema = Type.Object({
  traceId: Type.String(),
  publisherId: Type.String(),
  fingerprint: Type.Object({
    fingerprintId: Type.String(),
  }),
  created: Type.Date(),
});

export const CampaignSchema = Type.Intersect([
  BaseSchema,
  Type.Object({
    campaignId: Type.String(),
    advertiserId: Type.String(),
    landingPage: Type.String(),
    status: Type.Enum(CampaignStatus),
    traces: Type.Array(CampaignTraceSchema),
  }),
]);

/**
 * MODEL
 */
export type Campaign = Static<typeof CampaignSchema> & IEntity;

export type CampaignTrace = Static<typeof CampaignTraceSchema>;
