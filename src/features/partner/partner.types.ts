import { Static, Type } from '@sinclair/typebox';

export const PartnerQuerySchema = Type.Object({
  widgetKey: Type.String({ default: 'c3eb59f1-3802-41ba-b0f1-709e13999967' }),
});

export const PartnerPageSchema = Type.Object({
  name: Type.String(),
  url: Type.String(),
  widgetKey: Type.String(),
  description: Type.Optional(Type.String()),
  promoMessage: Type.Optional(Type.String()),
  imageUrl: Type.Optional(Type.String()),
  todayVisits: Type.Optional(Type.Number()),
});

export const PartnerQueryResponseSchema = Type.Object({
  partners: Type.Array(PartnerPageSchema),
});

/** DTO */
export type PartnerQuery = Static<typeof PartnerQuerySchema>;

export type PartnerPage = Static<typeof PartnerPageSchema>;

export type PartnerQueryResponse = Static<typeof PartnerQueryResponseSchema>;
