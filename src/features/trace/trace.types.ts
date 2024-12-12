import { Type, Static } from '@sinclair/typebox';

export const TraceSchema = Type.Object({
  fingerprintId: Type.String(),
  email: Type.Optional(Type.String({ format: 'email' })),
  domain: Type.String(),
  page: Type.String(),
  title: Type.String(),
  referer: Type.String(),
  timestamp: Type.Date(),
});

export const CaptureTraceSchema = Type.Omit(TraceSchema, ['timestamp']);

export type Trace = Static<typeof TraceSchema>;

export type CaptureTraceDto = Static<typeof CaptureTraceSchema>;

// export type CaptureTraceDto = Omit<Trace, 'timestamp'>;

// export interface Trace {
//   fingerprintId: string;
//   email?: string;
//   domain: string;
//   page: string;
//   title: string;
//   referer: string;
//   timestamp: Date;
// }

export interface Profile {
  fingerprints: Fingerprint[];
  emails: Email[];
  visits: Visit[];
}

export interface Fingerprint {
  fingerprintId: string;
  created: Date;
  lastSeen: Date;
}

export interface Email {
  value: string;
  created: Date;
  lastSeen: Date;
}

export interface Visit {
  created: Date;
  domain: string;
  page: string;
  title: string;
  referer: string;
}
