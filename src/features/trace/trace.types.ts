export interface Trace {
  fingerprintId: string;
  email?: string;
  domain: string;
  page: string;
  title: string;
  referer: string;
  timestamp: Date;
}

export interface Profile {
  created: Date;
  lastSeen: Date;
  emails: Email[];
  visits: Visit[];
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

export type CaptureTraceDto = Omit<Trace, 'timestamp'>;
