import { test } from 'node:test';
import assert from 'node:assert';
import { build, clearDatabase } from '../../helper';
import { randomUUID } from 'node:crypto';
import { Profile } from '../../../src/features/trace/trace.types';
import { ProfileRepository } from '../../../src/features/trace/profile.repository';
import { ObjectId, type Collection, type Db } from 'mongodb';

test('trace:repository', async t => {
  const fastify = await build(t);
  const collection: Collection = fastify.mongo.db.collection('profiles');
  const profileRepository: ProfileRepository = fastify.repository.profile;

  t.before(async () => {
    await clearDatabase(fastify);
  });

  await t.test('should create new profile', async () => {
    // given
    const now = new Date(new Date().getTime() - 1 * 60 * 1000);

    const profile: Profile = {
      fingerprints: [
        {
          fingerprintId: randomUUID().toString(),
          created: now,
          lastSeen: now
        }
      ],
      visits: [],
      emails: []
    };

    // when
    var saved: Profile = await profileRepository.save(profile);

    // then
    assert.ok(saved._id);
    assert.ok(await collection.findOne({ _id: new ObjectId(saved._id) }));
  });

  await t.test('should find by fingerprintId', async () => {
    // given
    const now = new Date(new Date().getTime() - 1 * 60 * 1000);

    const profile: Profile = {
      fingerprints: [
        {
          fingerprintId: randomUUID().toString(),
          created: now,
          lastSeen: now
        }
      ],
      visits: [],
      emails: []
    };

    await profileRepository.save(profile);

    // when
    const found = await profileRepository.findByFingerprintId(profile.fingerprints[0].fingerprintId);
    assert.ok(found);
    const unknown = await profileRepository.findByFingerprintId(randomUUID().toString());
    assert.ifError(unknown);
  });

  await t.test('should find by email', async () => {
    // given
    const now = new Date(new Date().getTime() - 1 * 60 * 1000);

    const profile: Profile = {
      fingerprints: [
        {
          fingerprintId: randomUUID().toString(),
          created: now,
          lastSeen: now
        }
      ],
      visits: [],
      emails: [
        {
          value: 'test@test.pl',
          created: now,
          lastSeen: now
        }
      ]
    };

    await profileRepository.save(profile);

    // when
    const found = await profileRepository.findByEmail(profile.emails[0].value);
    assert.ok(found);
    const unknown = await profileRepository.findByEmail(randomUUID().toString());
    assert.ifError(unknown);
  });

  await t.test('should update profile', async () => {
    // given
    const now = new Date(new Date().getTime() - 1 * 60 * 1000);

    const profile: Profile = {
      fingerprints: [
        {
          fingerprintId: randomUUID().toString(),
          created: now,
          lastSeen: now
        }
      ],
      visits: [],
      emails: [
        {
          value: 'test@test.pl',
          created: now,
          lastSeen: now
        }
      ]
    };

    // when
    const saved = await profileRepository.save(profile);

    await profileRepository.save({
      _id: saved._id,
      ...profile
    });

    // when
    const found = await profileRepository.findByFingerprintId(profile.fingerprints[0].fingerprintId);
    assert.ok(found);
    assert.ok(found.updatedAt! > found.createdAt!);
  });
});
