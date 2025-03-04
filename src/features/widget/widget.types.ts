import { Static, Type } from '@sinclair/typebox';
import { DynamicBlueprint, DynamicConfig } from '../../dynamic/types';
import { BaseSchema, IEntity } from '../base.repository';

export enum WidgetStatus {
  PENDING = 'pending',
  REGISTERED = 'registered',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DELETED = 'deleted',
}

/**
 * SCHEMA
 */
export const WidgetSchema = Type.Intersect([
  BaseSchema,
  Type.Object({
    status: Type.Enum(WidgetStatus),
    userId: Type.String(),
    hookId: Type.Optional(Type.String()),
    widgetKey: Type.String(),
    code: Type.String(),
  }),
]);

export const WidgetQuerySchema = Type.Object({
  widgetKey: Type.String(),
});

export const WidgetDtoSchema = Type.Composite([Type.Partial(Type.Omit(WidgetSchema, ['createdAt', 'updatedAt']))]);

/**
 * MODEL
 */
export type Widget = Static<typeof WidgetSchema> & IEntity;

export interface WidgetCodeBlueprint extends DynamicBlueprint {
  widgetKey: string;
  links: WidgetPanelLink[];
}

export interface WidgetCodeConfig extends DynamicConfig {
  apiUrl: string;
}

export interface WidgetPanelLink {
  name: string;
  url: string;
  description?: string;
  widgetKey: string;
  sourceWidgetKey: string;
  partnerId?: string;
  campaignId?: string;
}

/**
 * DTO
 */
export type WidgetDto = Static<typeof WidgetDtoSchema>;

export type WidgetQueryDto = Static<typeof WidgetQuerySchema>;
