/**
 * A plugin that adds caching capabilities to Fastify server.
 * Creates a cache manager that handles multiple cache buckets.
 */
import fp from 'fastify-plugin';
import NodeCache from 'node-cache';
import { getFastifyInstance } from '../app.store';
import { CacheOptions } from '../app.types';
import { computeHashKey } from '../common/utils';

export default fp<CacheOptions>(async (fastify) => {
  const cacheRegistry = new Map<string, NodeCache>();

  const getOrCreateBucket = (bucketName: string, options: NodeCache.Options = {}) => {
    if (!cacheRegistry.has(bucketName)) {
      const defaultOptions: NodeCache.Options = {
        stdTTL: 600, // Default TTL: 10 minutes
        checkperiod: 120,
        useClones: false, // For better performance if your objects are immutable
      };

      const bucketOptions = { ...defaultOptions, ...options };
      cacheRegistry.set(bucketName, new NodeCache(bucketOptions));
    }

    return cacheRegistry.get(bucketName)!;
  };

  const cacheManager = {
    bucket: getOrCreateBucket,

    listBuckets: () => Array.from(cacheRegistry.keys()),

    clearBucket: (bucketName: string) => {
      const bucket = cacheRegistry.get(bucketName);
      if (bucket) {
        bucket.flushAll();
        return true;
      }
      return false;
    },

    clearAll: () => {
      cacheRegistry.forEach((cache) => cache.flushAll());
    },

    closeAll: () => {
      cacheRegistry.forEach((cache) => cache.close());
      cacheRegistry.clear();
    },
  };

  // Make cache manager available via decorator
  fastify.decorate('cacheManager', cacheManager);

  // Add lifecycle hook to close all caches on server shutdown
  fastify.addHook('onClose', () => {
    cacheManager.closeAll();
  });
});

/**
 * A decorator that caches the return value of a method.
 *
 * This decorator checks if a value is cached before executing the method.
 * If the value is found in cache, it returns the cached value.
 * Otherwise, it executes the method, caches the result, and then returns it.
 *
 * @param bucketName - The name of the cache bucket to use
 * @param options - Cache configuration options
 * @param options.ttl - The time-to-live value in seconds. After this time, the cached value will expire.
 *
 * @example
 * ```typescript
 * class UserService {
 *   @Cached('users', { ttl: 300 }) // Cache for 5 minutes
 *   async getUser(id: string) {
 *     // Method implementation
 *   }
 * }
 * ```
 */
export function Cached(bucketName: string, options: CacheOptions = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      // Get access to the Fastify instance (assuming it's available on 'this')
      // const fastify = this.fastify || this.app || this.server;
      const fastify = getFastifyInstance();
      if (!fastify || !fastify.cacheManager) {
        console.warn('Cache manager not available, skipping cache');
        return originalMethod.apply(this, args);
      }

      // Get the cache bucket
      const cache = fastify.cacheManager.bucket(bucketName, { stdTTL: options.ttl });
      const key = `${propertyKey}_${computeHashKey(args)}`;

      // Check cache
      const cached = cache.get(key);
      if (cached !== undefined) {
        return cached;
      }

      // Execute method and cache result
      const result = originalMethod.apply(this, args);

      // Handle promises
      if (result instanceof Promise) {
        return result.then((data) => {
          cache.set(key, data);
          return data;
        });
      }

      cache.set(key, result);
      return result;
    };

    return descriptor;
  };
}
