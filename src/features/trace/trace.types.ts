import { Static, Type } from '@sinclair/typebox';
import { BaseSchema, IEntity } from '../base.repository';

/**
 * SCHEMA
 */
export const TraceSchema = Type.Intersect([
  BaseSchema,
  Type.Object({
    traceId: Type.String(),
    email: Type.Optional(Type.String({ format: 'email' })),
    fingerprint: Type.Object({
      fingerprintId: Type.String(),
    }),
    geo: Type.Optional(
      Type.Object({
        language: Type.Optional(Type.String()),
        country: Type.Optional(Type.String()),
        city: Type.Optional(Type.String()),
        timezone: Type.Optional(Type.String()),
      }),
    ),
    device: Type.Optional(
      Type.Object({
        userAgent: Type.String(),
        platform: Type.String(),
        ip: Type.String(),
      }),
    ),
    page: Type.Object({
      domain: Type.String(),
      path: Type.String(),
      search: Type.String(),
      title: Type.String(),
      referer: Type.String(),
    }),
  }),
]);

export const FingerprintSchema = Type.Object({
  fingerprintId: Type.String(),
  created: Type.Date(),
  lastSeen: Type.Date(),
});

export const EmailSchema = Type.Object({
  value: Type.String(),
  created: Type.Date(),
  lastSeen: Type.Date(),
});

// export const VisitSchema = Type.Object({
//   created: Type.Date(),
//   domain: Type.String(),
//   page: Type.String(),
//   title: Type.String(),
//   referer: Type.String(),
// });

export const ProfileSchema = Type.Intersect([
  BaseSchema,
  Type.Object({
    fingerprints: Type.Array(FingerprintSchema),
    emails: Type.Array(EmailSchema),
    // visits: Type.Array(VisitSchema),
  }),
]);

/**
 * MODEL
 */
export type Trace = Static<typeof TraceSchema> & IEntity;

export type Profile = Static<typeof ProfileSchema> & IEntity;

export type Fingerprint = Static<typeof FingerprintSchema>;

export type Email = Static<typeof EmailSchema>;

// export type Visit = Static<typeof VisitSchema>;

/**
 * DTO
 */
export type CaptureTraceDto = Omit<Trace, '_id | createdAt | updatedAt'>;

export type ProfileDto = Omit<Profile, 'id'>;
