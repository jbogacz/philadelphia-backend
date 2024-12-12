import { ProfileRepository } from './profile.repository'; // @tslint: ignore
import { Fingerprint, Profile, Trace, Visit } from './trace.types';

export class TraceService {
  constructor(private profileRepository: ProfileRepository) {}

  capture(trace: Trace): Promise<Profile> {
    const now = new Date();
    
    const fingerprint: Fingerprint = {
      fingerprintId: trace.fingerprintId,
      created: now,
      lastSeen: now,
    };

    const visit: Visit = {
      created: now,
      domain: trace.domain,
      page: trace.page,
      title: trace.title,
      referer: trace.referer,
    } as Visit;

    const profile: Profile = {
      fingerprints: [fingerprint],
      visits: [visit],
      emails: [],
    };

    return this.profileRepository.create(profile);
  }
}
