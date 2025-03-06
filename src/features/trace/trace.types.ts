import { Static, Type } from '@sinclair/typebox';
import { BaseSchema, IEntity } from '../base.repository';

/**
 * SCHEMA
 */
export const FingerprintSchema = Type.Object({
  fingerprintId: Type.String(),
});

export const PageSchema = Type.Object({
  domain: Type.String(),
  path: Type.String(),
  search: Type.Optional(Type.String()),
  referer: Type.Optional(Type.String()),
});

export const TraceSchema = Type.Intersect([
  BaseSchema,
  Type.Object({
    type: Type.String(),
    traceId: Type.String(),
    fingerprint: FingerprintSchema,
    widgetKey: Type.String(),
    widgetId: Type.String(),
    hookId: Type.String(),
  }),
]);

export const VisitTraceSchema = Type.Intersect([
  TraceSchema,
  Type.Object({
    type: Type.Literal('visit'),
    page: PageSchema,
  }),
]);

export const WidgetTraceSchema = Type.Intersect([
  TraceSchema,
  Type.Object({
    type: Type.Literal('widget'),
    sourceWidgetKey: Type.String(),
    sourceWidgetId: Type.String(),
    sourceHookId: Type.String(),
  }),
]);

export const VisitTraceDtoSchema = Type.Omit(VisitTraceSchema, ['_id', 'createdAt', 'updatedAt', 'type', 'widgetId', 'hookId']);
export const WidgetTraceDtoSchema = Type.Omit(WidgetTraceSchema, [
  '_id',
  'createdAt',
  'updatedAt',
  'type',
  'widgetId',
  'hookId',
  'sourceWidgetId',
  'sourceHookId',
]);

/**
 * MODEL
 */
export type Trace = Static<typeof TraceSchema> & IEntity;

export type VisitTrace = Static<typeof VisitTraceSchema> & IEntity;

export type WidgetTrace = Static<typeof WidgetTraceSchema> & IEntity;

export type Fingerprint = Static<typeof FingerprintSchema>;

export type Page = Static<typeof PageSchema>;

/**
 * DTO
 */
export type VisitTraceDto = typeof VisitTraceDtoSchema.static;

export type WidgetTraceDto = typeof WidgetTraceDtoSchema.static;
