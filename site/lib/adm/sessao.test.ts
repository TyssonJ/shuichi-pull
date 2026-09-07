import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sessaoAdm, exigirAdm, exigirChefe } from './sessao';

vi.mock('@/auth', () => ({ auth: vi.fn() }));
import { auth } from '@/auth';

describe('sessaoAdm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('devolve null sem sessão', async () => {
    vi.mocked(auth).mockResolvedValue(null);
    expect(await sessaoAdm()).toBeNull();
  });

  it('devolve null para quem tem sessão mas não é administrador', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { discordId: '1', papel: null } } as never);
    expect(await sessaoAdm()).toBeNull();
  });

  it('devolve os dados de quem é adm', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { discordId: '1', papel: 'adm' } } as never);
    expect(await sessaoAdm()).toEqual({ discordId: '1', papel: 'adm' });
  });
});

describe('exigirAdm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lança erro sem sessão de adm', async () => {
    vi.mocked(auth).mockResolvedValue(null);
    await expect(exigirAdm()).rejects.toThrow('Acesso negado');
  });

  it('devolve a sessão quando é adm', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { discordId: '1', papel: 'adm' } } as never);
    await expect(exigirAdm()).resolves.toEqual({ discordId: '1', papel: 'adm' });
  });

  it('aceita chefe também, porque chefe pode tudo que adm pode', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { discordId: '1', papel: 'chefe' } } as never);
    await expect(exigirAdm()).resolves.toEqual({ discordId: '1', papel: 'chefe' });
  });
});

describe('exigirChefe', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lança erro para adm comum', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { discordId: '1', papel: 'adm' } } as never);
    await expect(exigirChefe()).rejects.toThrow('Acesso negado');
  });

  it('devolve a sessão quando é chefe', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { discordId: '1', papel: 'chefe' } } as never);
    await expect(exigirChefe()).resolves.toEqual({ discordId: '1', papel: 'chefe' });
  });
});
