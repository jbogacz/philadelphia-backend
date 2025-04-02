import { Static, Type } from '@sinclair/typebox';

export const PartnerQuerySchema = Type.Object({
  hookId: Type.String({ default: '67c54a431a17eacc9f0cc74b' }),
  includeVisits: Type.Optional(Type.Boolean({ default: false })),
});

export const PartnerPageSchema = Type.Object({
  name: Type.String(),
  url: Type.String(),
  widgetKey: Type.String(),
  description: Type.Optional(Type.String()),
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
