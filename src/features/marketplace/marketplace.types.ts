import { Static, Type } from '@sinclair/typebox';
import { BaseSchema, IEntity, RangeSchema } from '../base.repository';

/**
 * ENUMS
 */
export enum DemandStatus {
  OPEN = 'open',
  ASSIGNED = 'assigned',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

/**
 * SCHEMA
 */
export const DemandSchema = Type.Intersect([
  BaseSchema,
  Type.Object({
    hookId: Type.String(),
    userId: Type.String(),
    title: Type.String(),
    description: Type.String(),
    goal: Type.Number(),
    budget: RangeSchema,
    duration: Type.Union([Type.Literal(7), Type.Literal(14), Type.Literal(30)]),
    status: Type.Enum(DemandStatus),
    audience: Type.String(),
  }),
]);

export const DemandDtoSchema = Type.Composite([
  Type.Omit(DemandSchema, ['createdAt', 'updatedAt', 'budget', 'status']),
  Type.Object({
    createdAt: Type.Optional(Type.String({ format: 'date-time' })),
    updatedAt: Type.Optional(Type.String({ format: 'date-time' })),
    budget: Type.Object({
      min: Type.Number(),
      max: Type.Number(),
    }),
    status: Type.Optional(Type.Enum(DemandStatus)),
  }),
]);

export const UpdateDemandDtoSchema = Type.Composite([
  Type.Partial(Type.Omit(DemandSchema, ['createdAt', 'updatedAt', 'budget'])),
  Type.Object({
    createdAt: Type.Optional(Type.String({ format: 'date-time' })),
    updatedAt: Type.Optional(Type.String({ format: 'date-time' })),
    budget: Type.Optional(
      Type.Object({
        min: Type.Optional(Type.Number()),
        max: Type.Optional(Type.Number()),
      })
    ),
  }),
]);

/**
 * MODEL
 */
export type Demand = Static<typeof DemandSchema> & IEntity;

/**
 * DTO
 */
export type DemandDto = Static<typeof DemandDtoSchema>;
