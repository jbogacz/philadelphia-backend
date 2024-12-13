import { Static, Type } from '@sinclair/typebox';
import { IEntity } from '../base.repository';

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
