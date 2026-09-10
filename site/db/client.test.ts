import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('db/client.ts — Proxy preguicoso', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('importar o módulo não lança erro mesmo com DATABASE_URL não configurada', async () => {
    vi.stubEnv('DATABASE_URL', '');
    vi.doMock('postgres', () => ({
      default: vi.fn(),
    }));
    vi.doMock('drizzle-orm/postgres-js', () => ({
      drizzle: vi.fn(() => ({})),
    }));

    // Importar o módulo não deve lançar
    const { db } = await import('./client');
    expect(db).toBeDefined();
  });

  it('acessar db.select lança erro de DATABASE_URL não configurada quando unset', async () => {
    vi.stubEnv('DATABASE_URL', '');
    vi.doMock('postgres', () => ({
      default: vi.fn(),
    }));
    vi.doMock('drizzle-orm/postgres-js', () => ({
      drizzle: vi.fn(() => ({})),
    }));

    const { db } = await import('./client');

    expect(() => {
      // Tentar acessar uma propriedade do Proxy deve lançar o erro de DATABASE_URL
      const _x = db.select;
    }).toThrow('DATABASE_URL não configurada');
  });

  it('acessar db.select não lança depois de configurar DATABASE_URL (com postgres/drizzle mockados)', async () => {
    vi.stubEnv('DATABASE_URL', 'postgresql://test:test@localhost/test');

    const mockSelect = vi.fn(() => ({}));
    const mockDrizzle = vi.fn(() => ({
      select: mockSelect,
    }));

    vi.doMock('postgres', () => ({
      default: vi.fn(),
    }));
    vi.doMock('drizzle-orm/postgres-js', () => ({
      drizzle: mockDrizzle,
    }));

    const { db } = await import('./client');

    // Acessar db.select não deve lançar quando DATABASE_URL está configurada
    expect(() => {
      const _x = db.select;
    }).not.toThrow();
  });
});
