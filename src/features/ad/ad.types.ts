import { Static, Type } from '@sinclair/typebox';
import { BaseSchema, IEntity } from '../base.repository';

export enum ImpressionType {
  RENDERED = 'rendered',
  VIEWABLE = 'viewable',
  VIEWED = 'viewed',
  CLICKED = 'clicked',
  ERROR = 'error',
}

/**
 * SCHEMA
 */
const ImpressionSchema = Type.Intersect([
  BaseSchema,
  Type.Object({
    type: Type.Enum(ImpressionType),
    traceId: Type.String(),
    fingerprintId: Type.String(),
    publisherId: Type.String(),
    campaignId: Type.String(),
    advertiserId: Type.String(),
    creativeId: Type.String(),
    // customParams: Type.Optional(Type.Object(Type.String())),
  }),
]);

/**
 * MODEL
 */
export type Impression = Static<typeof ImpressionSchema> & IEntity;

export interface AdCreative {
  creativeId: string;
  creativeUrl: string;
  campaignId: string;
  advertiserId: string;
}

export interface AdMarkupBlueprint {
  publisherId: string;
  targetId: string;
  advertiserId: string;
  campaignId: string;
  creativeId: string;
  creativeUrl: string;
}

export interface AdMarkupConfig {
  traceApiUrl: string;
  impressionApiUrl: string;
}

/**
 * DTO
 */
export type ImpressionEvent = Omit<Impression, '_id' | 'createdAt' | 'updatedAt'>;
