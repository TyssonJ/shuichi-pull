import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/auth', () => ({ auth: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/db/repositorios/usuarios', () => ({
  repositorioUsuarios: { atualizarPerfil: vi.fn(), atualizarPersonalizacao: vi.fn() },
}));
vi.mock('@/lib/dados-corrigidos', () => ({
  listarPersonagensComCorrecoes: vi.fn(async () => [{ id: 'shuichi-saihara' }]),
}));

import { auth } from '@/auth';
import { repositorioUsuarios } from '@/db/repositorios/usuarios';
import { revalidatePath } from 'next/cache';
import { salvarPersonalizacaoAction } from './acoes';

const logado = () => vi.mocked(auth).mockResolvedValue({ user: { discordId: '42' } } as never);

describe('salvarPersonalizacaoAction', () => {
  beforeEach(() => vi.clearAllMocks());

  it('exige login', async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    expect(await salvarPersonalizacaoAction({ bio: 'oi', bannerTipo: 'preset', bannerValor: 'terminal' })).toEqual({ ok: false, erro: expect.stringContaining('Entra com o Discord') });
    expect(repositorioUsuarios.atualizarPersonalizacao).not.toHaveBeenCalled();
  });

  it('grava só na conta de quem está logado, com bio e banner validados', async () => {
    logado();
    await salvarPersonalizacaoAction({ bio: '  detetive  ', bannerTipo: 'personagem', bannerValor: 'shuichi-saihara' });
    expect(repositorioUsuarios.atualizarPersonalizacao).toHaveBeenCalledWith('42', {
      bio: 'detetive', bannerTipo: 'personagem', bannerValor: 'shuichi-saihara',
    });
    expect(revalidatePath).toHaveBeenCalledWith('/u/42');
  });

  it('descrição vazia grava null', async () => {
    logado();
    await salvarPersonalizacaoAction({ bio: '   ', bannerTipo: 'preset', bannerValor: 'ciano' });
    expect(repositorioUsuarios.atualizarPersonalizacao).toHaveBeenCalledWith('42', expect.objectContaining({ bio: null }));
  });

  it('rejeita bio grande, host de imagem não permitido e personagem fora do elenco', async () => {
    logado();
    expect(await salvarPersonalizacaoAction({ bio: 'a'.repeat(400), bannerTipo: 'preset', bannerValor: 'terminal' })).toEqual({ ok: false, erro: expect.stringContaining('280') });
    expect(await salvarPersonalizacaoAction({ bio: '', bannerTipo: 'url', bannerValor: 'https://evil.example/x.png' })).toEqual({ ok: false, erro: expect.stringContaining('Use uma imagem') });
    expect(await salvarPersonalizacaoAction({ bio: '', bannerTipo: 'personagem', bannerValor: 'fantasma' })).toEqual({ ok: false, erro: expect.stringContaining('elenco') });
    expect(repositorioUsuarios.atualizarPersonalizacao).not.toHaveBeenCalled();
  });
});
