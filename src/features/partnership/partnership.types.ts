import { Static, Type } from '@sinclair/typebox';
import { BaseSchema, IEntity } from '../base.repository';

export const PartnershipSchema = Type.Intersect([
  BaseSchema,
  Type.Object({
    sourceWidgetKey: Type.String(),
    widgetKey: Type.String(),
    pageName: Type.String(),
    pageUrl: Type.String(),
    pageDescription: Type.String(),
  }),
]);

export type Partnership = Static<typeof PartnershipSchema> & IEntity;
