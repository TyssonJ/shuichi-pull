import { describe, it, expect, vi, afterEach } from 'vitest';
import { GET } from './route';

afterEach(() => vi.useRealTimers());

describe('GET /api/hora', () => {
  it('devolve a hora do servidor, sem cache (senão a medição do relógio não serve)', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-21T20:00:00.000Z'));
    const r = GET();
    expect(await r.json()).toEqual({ agora: Date.parse('2026-09-21T20:00:00.000Z') });
    expect(r.headers.get('cache-control')).toBe('no-store');
  });
});
