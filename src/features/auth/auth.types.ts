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
    email: Type.String(),
    password: Type.String(),
    role: Type.Enum(UserRole),
  }),
]);

/**
 * MODEL
 */
export type User = Static<typeof UserSchema> & IEntity;

/**
 * DTO
 */
export type AuthRequest = {
  email: string;
  password: string;
};

export type AuthResponse = {
  token: string;
  user: {
    email: string;
    role: UserRole;
  };
};

/**
 * ERROR
 */
export class AuthorizationError extends Error {
  constructor() {
    super();
  }
}
