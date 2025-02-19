import { Static, Type } from '@sinclair/typebox';
import { BaseSchema, IEntity } from '../base.repository';

/**
 * SCHEMA
 */
export const HookSchema = Type.Intersect([
  BaseSchema,
  Type.Object({
    name: Type.String(),
    domain: Type.Optional(Type.String()),
    favicon: Type.Optional(Type.String()),
    userId: Type.String(),
    widgetId: Type.Optional(Type.String()),
    notificationsCount: Type.Optional(Type.Number()),
  }),
]);

export const HookQuerySchema = Type.Object({
  userId: Type.String(),
});

export const HookDtoSchema = Type.Composite([
  Type.Omit(HookSchema, ['_id', 'createdAt', 'updatedAt']),
  Type.Object({
    id: Type.Optional(Type.String()),
  }),
]);
/**
 * MODEL
 */
export type Hook = Static<typeof HookSchema> & IEntity;

/**
 * DTO
 */
export type HookDto = Static<typeof HookDtoSchema>;

export type HookQueryDto = Static<typeof HookQuerySchema>;
