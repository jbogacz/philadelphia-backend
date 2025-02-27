import { Static, Type } from '@sinclair/typebox';
import { BaseSchema, IEntity } from '../base.repository';

export enum WidgetStatus {
  PENDING = 'pending',
  REGISTERED = 'registered',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
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
  apiKey: Type.String(),
  widgetKey: Type.String(),
});

export const WidgetDtoSchema = Type.Composite([
  Type.Partial(Type.Omit(WidgetSchema, ['createdAt', 'updatedAt'])),
]);

/**
 * MODEL
 */
export type Widget = Static<typeof WidgetSchema> & IEntity;

/**
 * DTO
 */
export type WidgetDto = Static<typeof WidgetDtoSchema>;

export type WidgetQueryDto = Static<typeof WidgetQuerySchema>;
