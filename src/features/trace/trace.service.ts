import { LoggerService } from '../../common';
import { ProfileRepository } from './profile.repository';
import { TraceRepository } from './trace.repository';
import { Profile, Trace } from './trace.types';

export class TraceService {
  constructor(
    private readonly traceRepository: TraceRepository,
    private readonly profileRepository: ProfileRepository,
  ) {}

  private logger = LoggerService.getLogger('feature.trace.TraceService');

  async capture(trace: Trace): Promise<Profile> {
    this.logger.info('Capturing trace', { trace });
    
    // Save the trace
    await this.traceRepository.save(trace);

    // Update or create the profile
    const now = new Date();

    var profile = trace.email ? await this.profileRepository.findByEmail(trace.email) : null;
    profile =
      profile ??
      (await this.profileRepository.findByFingerprintId(trace.fingerprint.fingerprintId));
    profile = profile ?? ({ fingerprints: [], emails: [], visits: [] } as Profile);

    if (trace.email) {
      const email = profile.emails.find(e => e.value == trace.email);
      if (email) {
        email.lastSeen = now;
      } else {
        profile.emails.push({ value: trace.email, created: now, lastSeen: now });
      }
    }

    const fingerprint = profile.fingerprints.find(
      f => f.fingerprintId === trace.fingerprint.fingerprintId,
    );
    if (fingerprint) {
      fingerprint.lastSeen = now;
    } else {
      profile.fingerprints.push({
        fingerprintId: trace.fingerprint.fingerprintId,
        created: now,
        lastSeen: now,
      });
    }

    return this.profileRepository.save(profile as Profile);
  }
}
