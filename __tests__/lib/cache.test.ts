import { getCache, setCache, deleteCache, clearCache, withCache, cacheKey } from '@/lib/cache';

describe('Cache', () => {
  beforeEach(() => {
    clearCache();
  });

  describe('setCache and getCache', () => {
    it('should store and retrieve values', () => {
      setCache('test-key', 'test-value', 60);
      const value = getCache('test-key');
      expect(value).toBe('test-value');
    });

    it('should return null for non-existent keys', () => {
      const value = getCache('non-existent');
      expect(value).toBeNull();
    });

    it('should expire values after TTL', async () => {
      setCache('test-key', 'test-value', 0.1); // 100ms TTL
      await new Promise((resolve) => setTimeout(resolve, 150));
      const value = getCache('test-key');
      expect(value).toBeNull();
    });

    it('should handle different data types', () => {
      setCache('string', 'test', 60);
      setCache('number', 42, 60);
      setCache('object', { key: 'value' }, 60);
      setCache('array', [1, 2, 3], 60);

      expect(getCache('string')).toBe('test');
      expect(getCache('number')).toBe(42);
      expect(getCache('object')).toEqual({ key: 'value' });
      expect(getCache('array')).toEqual([1, 2, 3]);
    });
  });

  describe('deleteCache', () => {
    it('should delete cached values', () => {
      setCache('test-key', 'test-value', 60);
      deleteCache('test-key');
      const value = getCache('test-key');
      expect(value).toBeNull();
    });
  });

  describe('clearCache', () => {
    it('should clear all cached values', () => {
      setCache('key1', 'value1', 60);
      setCache('key2', 'value2', 60);
      clearCache();
      expect(getCache('key1')).toBeNull();
      expect(getCache('key2')).toBeNull();
    });
  });

  describe('withCache', () => {
    it('should cache function results', async () => {
      let callCount = 0;
      const fn = async () => {
        callCount++;
        return 'result';
      };

      const result1 = await withCache('test-key', fn, 60);
      const result2 = await withCache('test-key', fn, 60);

      expect(result1).toBe('result');
      expect(result2).toBe('result');
      expect(callCount).toBe(1); // Function should only be called once
    });

    it('should call function again after cache expires', async () => {
      let callCount = 0;
      const fn = async () => {
        callCount++;
        return 'result';
      };

      await withCache('test-key', fn, 0.1); // 100ms TTL
      await new Promise((resolve) => setTimeout(resolve, 150));
      await withCache('test-key', fn, 0.1);

      expect(callCount).toBe(2); // Function should be called twice
    });
  });

  describe('cacheKey', () => {
    it('should generate cache keys from parameters', () => {
      const key = cacheKey('prefix', 'param1', 123, 'param3');
      expect(key).toBe('prefix:param1:123:param3');
    });
  });
});

