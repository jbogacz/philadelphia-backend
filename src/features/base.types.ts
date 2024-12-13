import { Type } from '@sinclair/typebox';

export const BaseDocumentSchema = Type.Object({
  _id: Type.Optional(Type.String()),
  createdAt: Type.Optional(Type.String({ format: 'date-time' })),
  updatedAt: Type.Optional(Type.String({ format: 'date-time' }))
});

export interface BaseModel {
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
