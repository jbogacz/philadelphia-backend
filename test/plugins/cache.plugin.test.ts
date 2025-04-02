import * as assert from 'node:assert';
import test from 'node:test';
import { instance, spy, verify } from 'ts-mockito';
import { Cached } from '../../src/plugins/cache.plugin';
import { build } from '../helper';

class Foo {
  constructor(private readonly bar: Bar) {}

  @Cached('foo', {})
  method(): string {
    return this.bar.method();
  }

  @Cached('fooWithTtl', { ttl: 1 })
  methodWithTtl(): string {
    return this.bar.method();
  }

  @Cached('fooAsync', {})
  async methodAsync(): Promise<string> {
    return this.bar.methodAsync();
  }
}

class Bar {
  method(): string {
    return 'bar';
  }
  async methodAsync(): Promise<string> {
    return 'async bar';
  }
}

test('cache:plugin', async (t) => {
  await build(t);

  await t.test('should call target method only once', async () => {
    const bar = spy(new Bar());
    const foo = new Foo(instance(bar));

    foo.method();
    foo.method();
    const result = foo.method();

    assert.equal(result, 'bar');
    verify(bar.method()).once();
  });

  await t.test('should call target async method only once', async () => {
    const bar = spy(new Bar());
    const foo = new Foo(instance(bar));

    await foo.methodAsync();
    await foo.methodAsync();
    const result = await foo.methodAsync();

    assert.equal(result, 'async bar');
    verify(bar.methodAsync()).once();
  });

  await t.test('should call target method if ttl expired', async () => {
    const bar = spy(new Bar());
    const foo = new Foo(instance(bar));

    foo.methodWithTtl();
    await new Promise((resolve) => setTimeout(resolve, 1100));
    const result = foo.methodWithTtl();

    assert.equal(result, 'bar');
    verify(bar.method()).twice();
  });
});
