import * as assert from 'node:assert';
import test from 'node:test';
import { computeHashKey } from '../../src/common/utils';

test('common:utils', async (t) => {
  await t.test('should return same hash for same input', async () => {
    const input = {
      foo: 'bar',
      baz: 123,
      nested: {
        key: 'value',
      },
    };
    const otherInput = {
      foo: 'bar',
      baz: 124,
      nested: {
        key: 'value',
      },
    };

    const hash1 = computeHashKey(input);
    const hash2 = computeHashKey(input);
    const hash3 = computeHashKey(otherInput);

    assert.equal(hash1, hash2);
    assert.notEqual(hash1, hash3);
  });
});
