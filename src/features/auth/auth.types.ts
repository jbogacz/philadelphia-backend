import { Type } from '@sinclair/typebox';
import { BaseSchema } from '../base.repository';

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
    userId: Type.String(),
    email: Type.String(),
    password: Type.String(),
    role: Type.Enum(UserRole),
  }),
]);

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
    userId: string;
    email: string;
    role: UserRole
  }
};
