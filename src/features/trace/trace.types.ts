import { Type, Static } from '@sinclair/typebox';
import { ObjectId } from '@fastify/mongodb';

/**
 * SCHEMA
 */
export const BaseSchema = Type.Object({
  _id: Type.Optional(Type.String()),
  createdAt: Type.Optional(Type.Date()),
  updatedAt: Type.Optional(Type.Date())
});

export const TraceSchema = Type.Object({
  fingerprintId: Type.String(),
  email: Type.Optional(Type.String({ format: 'email' })),
  domain: Type.String(),
  page: Type.String(),
  title: Type.String(),
  referer: Type.String(),
  timestamp: Type.Date()
});

// export const CaptureTraceSchema = Type.Omit(TraceSchema, ['timestamp']);

export const FingerprintSchema = Type.Object({
  fingerprintId: Type.String(),
  created: Type.Date(),
  lastSeen: Type.Date()
});

export const EmailSchema = Type.Object({
  value: Type.String(),
  created: Type.Date(),
  lastSeen: Type.Date()
});

export const VisitSchema = Type.Object({
  created: Type.Date(),
  domain: Type.String(),
  page: Type.String(),
  title: Type.String(),
  referer: Type.String()
});

export const ProfileSchema = Type.Intersect([
  BaseSchema,
  Type.Object({
    fingerprints: Type.Array(FingerprintSchema),
    emails: Type.Array(EmailSchema),
    visits: Type.Array(VisitSchema)
  })
]);

/**
 * MODEL
 */
export interface IEntity {
  _id?: ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export type Trace = Static<typeof TraceSchema>;

export type Profile = Static<typeof ProfileSchema> & IEntity;

export type Fingerprint = Static<typeof FingerprintSchema>;

export type Email = Static<typeof EmailSchema>;

export type Visit = Static<typeof VisitSchema>;

/**
 * DTO
 */
export type CaptureTraceDto = Omit<Trace, 'timestamp'>;

export type ProfileDto = Omit<Profile, 'id'>;

// /**
//  * DOCUMENT
//  */
// export type ProfileDocument = Omit<Profile, 'id'> & {
//   _id?: string;
//   createdAt: Date;
//   updatedAt: Date;
// };
