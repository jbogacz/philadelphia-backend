import { Static, Type } from '@sinclair/typebox';
import { BaseSchema, IEntity } from '../base.repository';

export enum HookStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
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
    status: Type.Optional(Type.Enum(HookStatus)),
    userId: Type.String(),
    notificationsCount: Type.Optional(Type.Number()),
  }),
]);

export const HookQuerySchema = Type.Object({
  userId: Type.String(),
});

// export const HookDtoSchema = Type.Omit(HookSchema, ['_id', 'createdAt', 'updatedAt']);

export const HookDtoSchema = Type.Composite([
  Type.Omit(HookSchema, ['_id', 'createdAt', 'updatedAt', 'status']),
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
