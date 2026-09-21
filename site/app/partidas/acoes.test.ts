import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/auth', () => ({ auth: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/junko/servico', () => ({ emitirEvento: vi.fn() }));
vi.mock('@/db/repositorios/usuarios', () => ({ repositorioUsuarios: { buscar: vi.fn() } }));
vi.mock('@/db/repositorios/partida-avaliacoes', () => ({ repositorioPartidaAvaliacoes: {} }));
vi.mock('@/db/repositorios/partida-capitulos', () => ({ repositorioPartidaCapitulos: {} }));
vi.mock('@/db/repositorios/partidas', () => ({
  repositorioPartidas: {
    criar: vi.fn(), buscar: vi.fn(), participantes: vi.fn(), entrar: vi.fn(), sair: vi.fn(), mudarStatus: vi.fn(), atualizar: vi.fn(),
  },
}));

import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { emitirEvento } from '@/lib/junko/servico';
import { repositorioUsuarios } from '@/db/repositorios/usuarios';
import { repositorioPartidas } from '@/db/repositorios/partidas';
import {
  criarPartidaAction, entrarPartidaAction, sairPartidaAction, mudarStatusPartidaAction,
} from './acoes';

const partida = {
  id: 9, titulo: 'Sala 9', hostDiscordId: 'host1', dataHora: new Date('2026-09-22T00:00:00Z'), vagas: 2, status: 'agendada',
};
const logadoComo = (discordId: string) => vi.mocked(auth).mockResolvedValue({ user: { discordId } } as never);

beforeEach(() => {
  vi.clearAllMocks();
  logadoComo('user1');
  vi.mocked(repositorioPartidas.buscar).mockResolvedValue(partida as never);
  vi.mocked(repositorioPartidas.participantes).mockResolvedValue([]);
  vi.mocked(repositorioUsuarios.buscar).mockResolvedValue(null);
});

describe('entrarPartidaAction', () => {
  it('sem login: devolve a mensagem (não lança — em produção a mensagem de exceção some)', async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    expect(await entrarPartidaAction(9, null)).toEqual({ ok: false, erro: 'Entra com o Discord primeiro.' });
  });

  it('sala cheia devolve o aviso de "entre como reserva" e não grava', async () => {
    vi.mocked(repositorioPartidas.participantes).mockResolvedValue([
      { discordId: 'a', tipo: 'participante', personagemId: 'x' },
      { discordId: 'b', tipo: 'participante', personagemId: 'y' },
    ] as never);
    const r = await entrarPartidaAction(9, 'z');
    expect(r).toEqual({ ok: false, erro: expect.stringContaining('entre como reserva') });
    expect(repositorioPartidas.entrar).not.toHaveBeenCalled();
    expect(emitirEvento).not.toHaveBeenCalled();
  });

  it('Monokuma só pro host; partida encerrada não aceita', async () => {
    expect(await entrarPartidaAction(9, 'monokuma')).toEqual({ ok: false, erro: expect.stringContaining('host') });
    vi.mocked(repositorioPartidas.buscar).mockResolvedValue({ ...partida, status: 'finalizada' } as never);
    expect(await entrarPartidaAction(9, null)).toEqual({ ok: false, erro: expect.stringContaining('aceitando inscrição') });
  });

  it('entrando: grava, revalida e avisa o bot', async () => {
    const r = await entrarPartidaAction(9, 'shuichi-saihara');
    expect(r).toEqual({ ok: true, dados: undefined });
    expect(repositorioPartidas.entrar).toHaveBeenCalledWith(9, 'user1', 'shuichi-saihara', 'participante');
    expect(revalidatePath).toHaveBeenCalledWith('/partidas/9');
    expect(emitirEvento).toHaveBeenCalledWith({
      tipo: 'inscricao.entrou', partidaId: 9, discordId: 'user1', papel: 'participante', personagemId: 'shuichi-saihara',
    });
  });

  it('erro inesperado (banco fora) continua sendo lançado, sem virar mensagem', async () => {
    vi.mocked(repositorioPartidas.entrar).mockRejectedValue(new Error('connection refused'));
    await expect(entrarPartidaAction(9, null)).rejects.toThrow('connection refused');
  });
});

describe('criarPartidaAction', () => {
  const dados = { titulo: '  Trial  ', dataHora: '2026-09-22T20:00', regras: null, capaUrl: null, vagas: 16 };

  it('cria em horário de Brasília, devolve o id e avisa o bot', async () => {
    vi.mocked(repositorioPartidas.criar).mockResolvedValue(9);
    const r = await criarPartidaAction(dados);
    expect(r).toEqual({ ok: true, dados: 9 });
    expect(vi.mocked(repositorioPartidas.criar).mock.calls[0][0].dataHora.toISOString()).toBe('2026-09-22T23:00:00.000Z');
    expect(emitirEvento).toHaveBeenCalledWith(expect.objectContaining({
      tipo: 'partida.criada',
      partida: expect.objectContaining({ id: 9, titulo: 'Trial', hostDiscordId: 'user1', dataHora: '2026-09-22T23:00:00.000Z' }),
    }));
  });

  it('título vazio, data inválida e vagas fora do limite voltam como mensagem', async () => {
    expect(await criarPartidaAction({ ...dados, titulo: '  ' })).toEqual({ ok: false, erro: expect.stringContaining('título') });
    expect(await criarPartidaAction({ ...dados, dataHora: 'lixo' })).toEqual({ ok: false, erro: expect.stringContaining('Data') });
    expect((await criarPartidaAction({ ...dados, vagas: 999 })).ok).toBe(false);
    expect(repositorioPartidas.criar).not.toHaveBeenCalled();
    expect(emitirEvento).not.toHaveBeenCalled();
  });

  it('host sem permissão: a mensagem chega', async () => {
    vi.mocked(repositorioUsuarios.buscar).mockResolvedValue({ podeSerHost: false } as never);
    expect(await criarPartidaAction(dados)).toEqual({ ok: false, erro: expect.stringContaining('permissão de host') });
  });
});

describe('eventos de saída para o bot', () => {
  it('sair avisa o bot', async () => {
    await sairPartidaAction(9);
    expect(emitirEvento).toHaveBeenCalledWith({ tipo: 'inscricao.saiu', partidaId: 9, discordId: 'user1' });
  });

  it('host finalizando ou cancelando avisa; voltar pra agendada não', async () => {
    logadoComo('host1');
    await mudarStatusPartidaAction(9, 'finalizada');
    expect(emitirEvento).toHaveBeenLastCalledWith(expect.objectContaining({ tipo: 'partida.finalizada' }));
    await mudarStatusPartidaAction(9, 'cancelada');
    expect(emitirEvento).toHaveBeenLastCalledWith(expect.objectContaining({ tipo: 'partida.cancelada' }));

    vi.mocked(emitirEvento).mockClear();
    await mudarStatusPartidaAction(9, 'agendada');
    expect(emitirEvento).not.toHaveBeenCalled();
  });
});
