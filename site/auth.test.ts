import { describe, it, expect, vi, beforeEach } from 'vitest';

// O pacote `next-auth` real (via NextAuth(...) no topo de auth.ts) importa
// `next/server` sem extensão, o que quebra a resolução ESM do Vitest neste
// projeto ("Cannot find module '.../next/server'") — mesmo antes desta
// correção, com qualquer teste que importe '@/auth'. Como esse quebra é de
// infraestrutura (não do código sob teste), a chamada NextAuth(...) é
// substituída por um stub para permitir testar jwtCallback/resolvePapel,
// que são lógica pura e não dependem do restante de next-auth.
vi.mock('next-auth', () => ({
  default: () => ({ handlers: {}, auth: vi.fn(), signIn: vi.fn(), signOut: vi.fn() }),
}));
vi.mock('next-auth/providers/discord', () => ({ default: {} }));

vi.mock('@/db/repositorios/administradores', () => ({
  repositorioAdms: { buscarAdm: vi.fn() },
}));

vi.mock('@/db/repositorios/usuarios', () => ({ repositorioUsuarios: { buscar: vi.fn().mockResolvedValue(null) } }));

import { repositorioAdms } from '@/db/repositorios/administradores';
import { resolvePapel, jwtCallback } from './auth';

describe('resolvePapel', () => {
  beforeEach(() => vi.clearAllMocks());

  it('devolve chefe para o discordId do chefe fundador, sem consultar o banco', async () => {
    const anterior = process.env.ADM_CHEFE_DISCORD_ID;
    process.env.ADM_CHEFE_DISCORD_ID = '9';

    expect(await resolvePapel('9')).toBe('chefe');
    expect(repositorioAdms.buscarAdm).not.toHaveBeenCalled();

    process.env.ADM_CHEFE_DISCORD_ID = anterior;
  });

  it('devolve o papel salvo no banco para quem não é o chefe fundador', async () => {
    vi.mocked(repositorioAdms.buscarAdm).mockResolvedValue({ papel: 'adm' } as never);

    expect(await resolvePapel('1')).toBe('adm');
  });

  it('devolve null para quem não está cadastrado como administrador', async () => {
    vi.mocked(repositorioAdms.buscarAdm).mockResolvedValue(null as never);

    expect(await resolvePapel('1')).toBeNull();
  });
});

describe('jwtCallback', () => {
  beforeEach(() => vi.clearAllMocks());

  it('revalida o papel a cada chamada, então um rebaixamento entre requisições vale já na próxima (sem esperar o token expirar)', async () => {
    // Primeira chamada: login inicial no Discord (account/profile presentes).
    vi.mocked(repositorioAdms.buscarAdm).mockResolvedValue({ papel: 'adm' } as never);

    const token1 = await jwtCallback({
      token: {},
      account: { provider: 'discord' },
      profile: { id: '123' },
    } as unknown as Parameters<typeof jwtCallback>[0]);

    expect(token1.discordId).toBe('123');
    expect(token1.papel).toBe('adm');

    // Segunda chamada: refresh de sessão (sem account/profile, discordId já
    // vem do token anterior). Nesse meio-tempo um chefe rebaixou o adm.
    vi.mocked(repositorioAdms.buscarAdm).mockResolvedValue(null as never);

    const token2 = await jwtCallback({
      token: token1,
    } as unknown as Parameters<typeof jwtCallback>[0]);

    expect(token2.papel).toBeNull();
  });

  it('não toca no discordId quando não há account/profile (chamadas depois do login)', async () => {
    vi.mocked(repositorioAdms.buscarAdm).mockResolvedValue({ papel: 'chefe' } as never);

    const token = await jwtCallback({
      token: { discordId: '456' },
    } as unknown as Parameters<typeof jwtCallback>[0]);

    expect(token.discordId).toBe('456');
    expect(repositorioAdms.buscarAdm).toHaveBeenCalledWith('456');
  });
});
