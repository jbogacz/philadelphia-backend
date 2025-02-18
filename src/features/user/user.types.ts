import { Static, Type } from '@sinclair/typebox';
import { BaseSchema, IEntity } from '../base.repository';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

/**
 * SCHEMA
 */
export const UserSchema = Type.Intersect([
  BaseSchema,
  Type.Object({
    id: Type.String(),
    email: Type.String(),
    role: Type.Enum(UserRole),
  }),
]);

// export const UserDtoSchema = Type.Omit(UserSchema, ['_id', 'createdAt', 'updatedAt']);

export const UserDtoSchema = Type.Composite([
  Type.Omit(UserSchema, ['_id', 'createdAt', 'updatedAt', 'role']),
  Type.Object({
    role: Type.Optional(Type.Enum(UserRole))
  })
])

/**
 * MODEL
 */
export type User = Static<typeof UserSchema> & IEntity;

/**
 * DTO
 */
export type UserDto = Static<typeof UserDtoSchema>;

/**
 * ERROR
 */
export class AuthorizationError extends Error {
  constructor() {
    super();
  }
}
