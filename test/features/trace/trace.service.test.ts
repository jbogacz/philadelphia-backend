import * as assert from 'node:assert';
import {
  mock,
  instance,
  when,
  verify,
  anything,
  capture,
  objectContaining,
} from 'ts-mockito';
import { TraceService } from '../../../src/features/trace/trace.service';
import { ProfileRepository } from '../../../src/features/trace/profile.repository';
import { Profile, Trace } from '../../../src/features/trace/trace.types';
import { randomUUID } from 'crypto';
import test from 'node:test';
import { TraceRepository } from '../../../src/features/trace/trace.repository';

test('trace:service', async t => {
  let traceService: TraceService;
  let traceRepository: TraceRepository;
  let profileRepository: ProfileRepository;

  const trace: Trace = {
    traceId: randomUUID().toString(),
    email: 'test@email.com',
    fingerprint: {
      fingerprintId: randomUUID().toString(),
    },
    page: {
      domain: 'www.philadelphia.com',
      path: '/page/1',
      search: '?foo=bar',
      title: 'Philadelphia Title',
      referer: 'www.referer.com',
    },
  };

  t.beforeEach(() => {
    traceRepository = mock<TraceRepository>();
    profileRepository = mock<ProfileRepository>();
    traceService = new TraceService(instance(traceRepository), instance(profileRepository));
  });

  await t.test('should create profile without email', async () => {
    const trace: Trace = {
      traceId: randomUUID().toString(),
      fingerprint: {
        fingerprintId: randomUUID().toString(),
      },
      page: {
        domain: 'www.philadelphia.com',
        path: '/page/1',
        search: '?foo=bar',
        title: 'Philadelphia Title',
        referer: 'www.referer.com',
      },
    };

    await traceService.capture(trace);

    verify(traceRepository.save(objectContaining({ traceId: trace.traceId }))).once();

    verify(profileRepository.findByEmail(anything())).never();
    verify(profileRepository.findByFingerprintId(trace.fingerprint.fingerprintId)).once();

    const [profile] = capture(profileRepository.save).last();
    assert.equal(profile.fingerprints.length, 1);
    assert.equal(profile.fingerprints[0].fingerprintId, trace.fingerprint.fingerprintId);
  });

  await t.test('should create profile with email', async () => {
    const traceWithEmail: Trace = {
      ...trace,
      email: 'test@test.pl',
    };

    await traceService.capture(traceWithEmail);

    verify(traceRepository.save(objectContaining({ traceId: traceWithEmail.traceId }))).once();

    verify(profileRepository.findByEmail(traceWithEmail.email!)).once();
    verify(profileRepository.findByFingerprintId(traceWithEmail.fingerprint.fingerprintId)).once();

    const [profile] = capture(profileRepository.save).last();
    assert.equal(profile.fingerprints.length, 1);
    assert.equal(profile.fingerprints[0].fingerprintId, traceWithEmail.fingerprint.fingerprintId);
    assert.equal(profile.fingerprints[0].created, profile.fingerprints[0].lastSeen);
    assert.equal(profile.emails.length, 1);
    assert.equal(profile.emails[0].value, traceWithEmail.email);
    assert.equal(profile.emails[0].created === profile.emails[0].lastSeen, true);
  });

  await t.test('should update profile with email', async () => {
    // given
    const now = new Date(new Date().getTime() - 1 * 60 * 1000);

    const traceWithEmail: Trace = {
      ...trace,
      email: 'test@test.pl',
    };

    const existingProfile: Profile = {
      _id: randomUUID.toString(),
      fingerprints: [
        {
          fingerprintId: traceWithEmail.fingerprint.fingerprintId,
          created: now,
          lastSeen: now,
        },
      ],
      emails: [],
    };

    when(
      profileRepository.findByFingerprintId(traceWithEmail.fingerprint.fingerprintId),
    ).thenResolve(existingProfile);

    // when
    await traceService.capture(traceWithEmail);

    // then
    verify(traceRepository.save(objectContaining({ traceId: traceWithEmail.traceId }))).once();

    verify(profileRepository.findByEmail(traceWithEmail.email!)).once();

    const [capturedProfile] = capture(profileRepository.save).last();
    assert.equal(capturedProfile.fingerprints.length, 1);
    assert.ok(
      capturedProfile.fingerprints[0].fingerprintId === traceWithEmail.fingerprint.fingerprintId,
    );
    assert.ok(capturedProfile.fingerprints[0].created < capturedProfile.fingerprints[0].lastSeen);
    assert.equal(capturedProfile.emails.length, 1);
    assert.equal(capturedProfile.emails[0].value, traceWithEmail.email);
    assert.ok(capturedProfile.emails[0].created === capturedProfile.emails[0].lastSeen);
  });

  await t.test('should update additional fingerprint', async () => {
    // given
    const now = new Date(new Date().getTime() - 1 * 60 * 1000);

    const traceWithEmail: Trace = {
      ...trace,
      email: 'test@test.pl',
    };

    const existingProfile: Profile = {
      _id: randomUUID.toString(),
      fingerprints: [
        {
          fingerprintId: randomUUID().toString(),
          created: now,
          lastSeen: now,
        },
      ],
      emails: [
        {
          value: traceWithEmail.email!!,
          created: now,
          lastSeen: now,
        },
      ],
    };

    when(profileRepository.findByEmail(traceWithEmail.email!)).thenResolve(existingProfile);

    // when
    await traceService.capture(traceWithEmail);

    // then
    verify(traceRepository.save(objectContaining({ traceId: traceWithEmail.traceId }))).once();

    verify(profileRepository.findByEmail(traceWithEmail.email!)).once();

    const [capturedProfile] = capture(profileRepository.save).last();
    assert.equal(capturedProfile.fingerprints.length, 2);
    assert.equal(capturedProfile.emails.length, 1);
    assert.equal(capturedProfile.emails[0].value, traceWithEmail.email);
    assert.ok(capturedProfile.emails[0].created < capturedProfile.emails[0].lastSeen);
  });
});
