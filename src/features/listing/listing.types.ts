import { Static, Type } from '@sinclair/typebox';
import { BaseSchema, IEntity } from '../base.repository';

export enum ListingType {
  OFFER = 'offer',
  DEMAND = 'demand',
}

/**
 * SCHEMA
 */
export const ListingSchema = Type.Intersect([
  BaseSchema,
  Type.Object({
    id: Type.String(),
    type: Type.Enum(ListingType),
    title: Type.String(),
    author: Type.String(),
    marketType: Type.String(),
    date: Type.String(),
    description: Type.String(),
    audience: Type.Optional(Type.String()),
    engagement: Type.Optional(Type.String()),
    targetAudience: Type.Optional(Type.String()),
    budget: Type.Optional(Type.String()),
  }),
]);

/**
 * MODEL
 */
export type Listing = Static<typeof ListingSchema> & IEntity;

/**
 * DTO
 */
export type ListingDto = Omit<Listing, '_id' | 'createdAt' | 'updatedAt'>;

export type ListingQueryDto = {
  type: ListingType;
};
