import { ProfileRepository2 } from './profile.repository'; // @tslint: ignore
import { Profile, Trace } from './trace.types';

export class TraceService {
  constructor(private profileRepository: ProfileRepository2) {}

  async capture(trace: Trace): Promise<Profile> {
    const now = new Date();

    var profile = trace.email ? await this.profileRepository.findByEmail(trace.email) : null;
    profile = profile ?? (await this.profileRepository.findByFingerprintId(trace.fingerprintId));
    profile = profile ?? ({ fingerprints: [], emails: [], visits: [] } as Profile);

    const fingerprint = profile.fingerprints.find(f => f.fingerprintId === trace.fingerprintId);
    if (fingerprint) {
      fingerprint.lastSeen = now;
    } else {
      profile.fingerprints.push({ fingerprintId: trace.fingerprintId, created: now, lastSeen: now });
    }

    profile.visits.push({
      created: now,
      domain: trace.domain,
      page: trace.page,
      title: trace.title,
      referer: trace.referer
    });

    return this.profileRepository.save(profile as Profile);
  }
}
