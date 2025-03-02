import { Static, Type } from '@sinclair/typebox';
import { BaseSchema, IEntity } from '../base.repository';

export enum HookCategory {
  ECOMMERCE = 'ecommerce',
  BUSINESS = 'business',
  PERSONAL = 'personal',
  BLOG = 'blog',
}

export enum HookStatus {
  PENDING = 'pending',
  REGISTERED = 'registered',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DELETED = 'deleted',
}

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
    widgetId: Type.String(),
    category: Type.Optional(Type.Enum(HookCategory)),
    status: Type.Optional(Type.Enum(HookStatus)),
    notificationsCount: Type.Optional(Type.Number()),
  }),
]);

export const HookQuerySchema = Type.Object({
  userId: Type.Optional(Type.String()),
});

export const HookDtoSchema = Type.Composite([
  Type.Omit(HookSchema, ['createdAt', 'updatedAt']),
  Type.Object({
    createdAt: Type.Optional(Type.String()),
    updatedAt: Type.Optional(Type.String()),
  }),
]);

export const HookUpdateDtoSchema = Type.Composite([
  Type.Partial(Type.Omit(HookSchema, ['createdAt', 'updatedAt'])),
  Type.Object({
    createdAt: Type.Optional(Type.String()),
    updatedAt: Type.Optional(Type.String()),
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

export type HookUpdateDto = Static<typeof HookUpdateDtoSchema>;
