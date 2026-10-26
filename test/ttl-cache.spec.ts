import { TtlCache } from '../src/shared/infrastructure/ttl-cache';

describe('TtlCache', () => {
  it('returns the value until it expires', () => {
    let now = 0;
    const cache = new TtlCache<string>(1_000, 10, () => now);
    cache.set('a', 'value');

    now = 999;
    expect(cache.get('a')).toBe('value');
    now = 1_000;
    expect(cache.get('a')).toBeUndefined();
  });

  it('evicts the oldest entry when full', () => {
    const cache = new TtlCache<number>(60_000, 2);
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);

    expect(cache.get('a')).toBeUndefined();
    expect(cache.get('b')).toBe(2);
    expect(cache.get('c')).toBe(3);
  });
});
