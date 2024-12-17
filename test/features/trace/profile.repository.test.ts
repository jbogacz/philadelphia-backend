import { test } from 'node:test';
import assert from 'node:assert';
import { build, clearDatabase } from '../../helper';
import { randomUUID } from 'node:crypto';
import { Profile } from '../../../src/features/trace/trace.types';

test('trace:repository', async t => {
  const app = await build(t);

  t.before(async () => {
    await clearDatabase(app);
  });

  await t.test('should create new profile', async () => {
    // given
    const now = new Date(new Date().getTime() - 1 * 60 * 1000);

    const profile: Profile = {
      _id: randomUUID.toString(),
      fingerprints: [
        {
          fingerprintId: randomUUID.toString(),
          created: now,
          lastSeen: now
        }
      ],
      visits: [
        {
          domain: 'www.test.com',
          page: 'www.test.com/page',
          referer: 'www.referer.com',
          title: 'Page title',
          created: now
        }
      ],
      emails: []
    };

    // when
    const saved: Profile = await app.repository.profile.save(profile);

    // then
    assert.ok(saved._id);
  });
});
