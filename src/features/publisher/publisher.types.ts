import { Static, Type } from '@sinclair/typebox';
import { BaseSchema, IEntity } from '../base.repository';

/**
 * SCHEMA
 */
const PublisherSchema = Type.Intersect([
  BaseSchema,
  Type.Object({
    publisherId: Type.String(),
  }),
]);

/**
 * MODEL
 */
export type Publisher = Static<typeof PublisherSchema> & IEntity;
