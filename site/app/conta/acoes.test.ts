import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/auth', () => ({ auth: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/junko/servico', () => ({ emitirEvento: vi.fn() }));
vi.mock('@/db/repositorios/usuarios', () => ({
  repositorioUsuarios: { atualizarPerfil: vi.fn(), atualizarPersonalizacao: vi.fn(), atualizarIdentidade: vi.fn(), buscar: vi.fn() },
}));
vi.mock('@/lib/dados-corrigidos', () => ({
  listarPersonagensComCorrecoes: vi.fn(async () => [{ id: 'shuichi-saihara', sprite: '/sprites/elenco/shuichi-saihara.webp' }]),
}));

import { auth } from '@/auth';
import { repositorioUsuarios } from '@/db/repositorios/usuarios';
import { revalidatePath } from 'next/cache';
import { salvarPersonalizacaoAction, atualizarPerfilAction } from './acoes';

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

  describe('apelido e ícone', () => {
    const base = { bio: '', bannerTipo: 'preset', bannerValor: 'terminal' };

    it('grava o apelido validado e o ícone de personagem já resolvido pro endereço do sprite', async () => {
      logado();
      const r = await salvarPersonalizacaoAction({ ...base, apelido: '  Shuichi   S. ', avatarTipo: 'personagem', avatarValor: 'shuichi-saihara' });
      expect(r.ok).toBe(true);
      expect(repositorioUsuarios.atualizarIdentidade).toHaveBeenCalledWith('42', {
        apelido: 'Shuichi S.', avatarTipo: 'personagem', avatarValor: 'shuichi-saihara',
        avatarUrl: '/sprites/elenco/shuichi-saihara.webp',
      });
    });

    it('apelido vazio e ícone discord limpam a personalização', async () => {
      logado();
      await salvarPersonalizacaoAction({ ...base, apelido: '', avatarTipo: 'discord', avatarValor: '' });
      expect(repositorioUsuarios.atualizarIdentidade).toHaveBeenCalledWith('42', {
        apelido: null, avatarTipo: null, avatarValor: null, avatarUrl: null,
      });
    });

    it('sem os campos de identidade, não mexe neles', async () => {
      logado();
      await salvarPersonalizacaoAction(base);
      expect(repositorioUsuarios.atualizarIdentidade).not.toHaveBeenCalled();
    });

    it('apelido inválido, ícone de host não permitido e personagem fora do elenco: mensagem e nada é gravado', async () => {
      logado();
      expect(await salvarPersonalizacaoAction({ ...base, apelido: 'a', avatarTipo: 'discord', avatarValor: '' }))
        .toEqual({ ok: false, erro: expect.stringContaining('ao menos 2') });
      expect(await salvarPersonalizacaoAction({ ...base, apelido: 'Ok', avatarTipo: 'url', avatarValor: 'https://evil.example/a.png' }))
        .toEqual({ ok: false, erro: expect.stringContaining('Use uma imagem') });
      expect(await salvarPersonalizacaoAction({ ...base, apelido: 'Ok', avatarTipo: 'personagem', avatarValor: 'fantasma' }))
        .toEqual({ ok: false, erro: expect.stringContaining('elenco') });
      expect(repositorioUsuarios.atualizarPersonalizacao).not.toHaveBeenCalled();
      expect(repositorioUsuarios.atualizarIdentidade).not.toHaveBeenCalled();
    });
  });
});

describe('atualizarPerfilAction — quem joga de main', () => {
  beforeEach(() => vi.clearAllMocks());

  it('revalida a ficha dos personagens que entraram e dos que saíram dos mains, e só deles', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { discordId: '42' } } as never);
    vi.mocked(repositorioUsuarios.buscar).mockResolvedValue({ mains: ['a', 'b'], uuidGmod: null } as never);

    await atualizarPerfilAction({ uuidGmod: null, mains: ['b', 'c'] });

    const rotas = vi.mocked(revalidatePath).mock.calls.map((c) => c[0]);
    expect(rotas).toEqual(expect.arrayContaining(['/elenco/a', '/elenco/c']));
    expect(rotas).not.toContain('/elenco/b');
  });

  it('trocar o apelido/ícone revalida a ficha dos mains da pessoa', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { discordId: '42' } } as never);
    vi.mocked(repositorioUsuarios.buscar).mockResolvedValue({ mains: ['x', 'y'] } as never);

    await salvarPersonalizacaoAction({ bio: '', bannerTipo: 'preset', bannerValor: 'terminal', apelido: 'Novo', avatarTipo: 'discord', avatarValor: '' });

    const rotas = vi.mocked(revalidatePath).mock.calls.map((c) => c[0]);
    expect(rotas).toEqual(expect.arrayContaining(['/elenco/x', '/elenco/y']));
  });
});
