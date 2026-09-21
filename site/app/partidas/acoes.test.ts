import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/auth', () => ({ auth: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/junko/servico', () => ({ emitirEvento: vi.fn() }));
vi.mock('@/db/repositorios/usuarios', () => ({ repositorioUsuarios: { buscar: vi.fn() } }));
vi.mock('@/db/repositorios/partida-avaliacoes', () => ({
  repositorioPartidaAvaliacoes: { avaliar: vi.fn(), remover: vi.fn() },
}));
vi.mock('@/db/repositorios/partida-capitulos', () => ({ repositorioPartidaCapitulos: {} }));
vi.mock('@/db/repositorios/partidas', () => ({
  repositorioPartidas: {
    criar: vi.fn(), buscar: vi.fn(), participantes: vi.fn(), entrar: vi.fn(), sair: vi.fn(), mudarStatus: vi.fn(),
    atualizar: vi.fn(), atualizarInscricao: vi.fn(), definirConvidado: vi.fn(),
  },
}));

import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { emitirEvento } from '@/lib/junko/servico';
import { repositorioUsuarios } from '@/db/repositorios/usuarios';
import { repositorioPartidas } from '@/db/repositorios/partidas';
import { repositorioPartidaAvaliacoes } from '@/db/repositorios/partida-avaliacoes';
import {
  criarPartidaAction, entrarPartidaAction, sairPartidaAction, mudarStatusPartidaAction,
  avaliarParticipanteAction, removerAvaliacaoAction,
  removerParticipanteAction, trocarInscricaoAction, marcarConvidadoAction,
} from './acoes';

const partida = {
  id: 9, titulo: 'Sala 9', hostDiscordId: 'host1', dataHora: new Date('2026-09-22T00:00:00Z'), vagas: 2,
  status: 'agendada', iniciadaEm: null as Date | null, finalizadaEm: null as Date | null,
};
const logadoComo = (discordId: string) => vi.mocked(auth).mockResolvedValue({ user: { discordId } } as never);
const comStatus = (status: string, extra: Record<string, unknown> = {}) =>
  vi.mocked(repositorioPartidas.buscar).mockResolvedValue({ ...partida, status, ...extra } as never);

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

  it('o Monokuma ocupa vaga: com a sala cheia de alunos o host não entra de Monokuma, e com uma sobrando entra', async () => {
    logadoComo('host1');
    vi.mocked(repositorioPartidas.participantes).mockResolvedValue([
      { discordId: 'a', tipo: 'participante', personagemId: 'x' },
      { discordId: 'b', tipo: 'participante', personagemId: 'y' },
    ] as never);
    expect(await entrarPartidaAction(9, 'monokuma')).toEqual({ ok: false, erro: expect.stringContaining('vagas de titular') });
    expect(repositorioPartidas.entrar).not.toHaveBeenCalled();

    // o host pode entrar como reserva mesmo com a sala cheia (reserva não ocupa vaga)
    expect((await entrarPartidaAction(9, 'monokuma', 'reserva')).ok).toBe(true);

    vi.mocked(repositorioPartidas.participantes).mockResolvedValue([
      { discordId: 'a', tipo: 'participante', personagemId: 'x' },
    ] as never);
    expect((await entrarPartidaAction(9, 'monokuma')).ok).toBe(true);
  });

  it('Monokuma só pro host; partida encerrada ou já em andamento não aceita inscrição', async () => {
    expect(await entrarPartidaAction(9, 'monokuma')).toEqual({ ok: false, erro: expect.stringContaining('host') });
    comStatus('finalizada');
    expect(await entrarPartidaAction(9, null)).toEqual({ ok: false, erro: expect.stringContaining('aceitando inscrição') });
    comStatus('em_andamento');
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

describe('mudarStatusPartidaAction — Começar / Finalizar / Cancelar', () => {
  beforeEach(() => logadoComo('host1'));

  it('só o host muda o status', async () => {
    logadoComo('outra-pessoa');
    expect(await mudarStatusPartidaAction(9, 'em_andamento')).toEqual({ ok: false, erro: expect.stringContaining('host') });
    expect(repositorioPartidas.mudarStatus).not.toHaveBeenCalled();
  });

  it('Começar: agendada → em andamento, carimba o horário e avisa o bot com o início', async () => {
    const r = await mudarStatusPartidaAction(9, 'em_andamento');
    expect(r.ok).toBe(true);
    expect(repositorioPartidas.mudarStatus).toHaveBeenCalledWith(9, 'em_andamento', expect.any(Date));
    const evento = vi.mocked(emitirEvento).mock.calls[0][0] as { tipo: string; partida: { status: string; iniciadaEm: string | null } };
    expect(evento.tipo).toBe('partida.iniciada');
    expect(evento.partida).toMatchObject({ status: 'em_andamento' });
    expect(evento.partida.iniciadaEm).not.toBeNull();
  });

  it('Finalizar: em andamento → finalizada, e o evento traz a duração em segundos', async () => {
    comStatus('em_andamento', { iniciadaEm: new Date(Date.now() - 90 * 60_000) });
    const r = await mudarStatusPartidaAction(9, 'finalizada');
    expect(r.ok).toBe(true);
    const evento = vi.mocked(emitirEvento).mock.calls[0][0] as { tipo: string; partida: { duracaoSegundos: number } };
    expect(evento.tipo).toBe('partida.finalizada');
    expect(evento.partida.duracaoSegundos).toBeGreaterThanOrEqual(90 * 60 - 2);
    expect(evento.partida.duracaoSegundos).toBeLessThanOrEqual(90 * 60 + 5);
  });

  it('Cancelar vale a partir de agendada e de em andamento', async () => {
    expect((await mudarStatusPartidaAction(9, 'cancelada')).ok).toBe(true);
    comStatus('em_andamento');
    expect((await mudarStatusPartidaAction(9, 'cancelada')).ok).toBe(true);
    expect(vi.mocked(emitirEvento).mock.calls.map((c) => (c[0] as { tipo: string }).tipo)).toEqual(['partida.cancelada', 'partida.cancelada']);
  });

  it('não pula etapa nem volta: agendada→finalizada, em andamento→agendada e partida encerrada', async () => {
    expect(await mudarStatusPartidaAction(9, 'finalizada')).toEqual({ ok: false, erro: expect.stringContaining('não pode ir pra') });
    comStatus('em_andamento');
    expect((await mudarStatusPartidaAction(9, 'agendada')).ok).toBe(false);
    comStatus('finalizada');
    expect((await mudarStatusPartidaAction(9, 'em_andamento')).ok).toBe(false);
    expect(repositorioPartidas.mudarStatus).not.toHaveBeenCalled();
    expect(emitirEvento).not.toHaveBeenCalled();
  });
});

describe('avaliarParticipanteAction — estrelas com texto obrigatório', () => {
  beforeEach(() => {
    comStatus('finalizada');
    vi.mocked(repositorioPartidas.participantes).mockResolvedValue([
      { discordId: 'user1', tipo: 'participante' }, { discordId: 'colega', tipo: 'participante' },
    ] as never);
    vi.mocked(repositorioPartidaAvaliacoes.avaliar).mockResolvedValue(77);
  });

  it('grava nota e texto, revalida o perfil e avisa o bot SEM dizer quem avaliou', async () => {
    const r = await avaliarParticipanteAction(9, 'colega', 4, '  jogou muito bem  ');
    expect(r.ok).toBe(true);
    expect(repositorioPartidaAvaliacoes.avaliar).toHaveBeenCalledWith({
      partidaId: 9, avaliadorDiscordId: 'user1', avaliadoDiscordId: 'colega', estrelas: 4, comentario: 'jogou muito bem',
    });
    expect(revalidatePath).toHaveBeenCalledWith('/u/colega');
    const evento = vi.mocked(emitirEvento).mock.calls[0][0];
    expect(evento).toEqual({
      tipo: 'avaliacao.registrada', avaliacaoId: 77, partidaId: 9, avaliadoDiscordId: 'colega', estrelas: 4, comentario: 'jogou muito bem',
    });
    expect(JSON.stringify(evento)).not.toContain('user1');
  });

  it('a nota 0 é válida', async () => {
    expect((await avaliarParticipanteAction(9, 'colega', 0, 'não apareceu no horário')).ok).toBe(true);
  });

  it('sem texto (ou curto demais) é recusado, com a mensagem, e nada é gravado', async () => {
    for (const texto of ['', '   ', null, 'ok']) {
      expect(await avaliarParticipanteAction(9, 'colega', 5, texto)).toEqual({ ok: false, erro: expect.stringContaining('Escreva a avaliação') });
    }
    expect(repositorioPartidaAvaliacoes.avaliar).not.toHaveBeenCalled();
  });

  it('nota fora de 0–5, autoavaliação, partida não finalizada e quem não jogou são barrados', async () => {
    expect((await avaliarParticipanteAction(9, 'colega', 6, 'texto válido aqui')).ok).toBe(false);
    expect((await avaliarParticipanteAction(9, 'user1', 5, 'texto válido aqui')).ok).toBe(false);
    expect((await avaliarParticipanteAction(9, 'estranho', 5, 'texto válido aqui')).ok).toBe(false);
    comStatus('em_andamento');
    expect(await avaliarParticipanteAction(9, 'colega', 5, 'texto válido aqui')).toEqual({ ok: false, erro: expect.stringContaining('finalizada') });
    expect(repositorioPartidaAvaliacoes.avaliar).not.toHaveBeenCalled();
  });

  it('apagar a própria avaliação avisa o bot', async () => {
    await removerAvaliacaoAction(9, 'colega');
    expect(repositorioPartidaAvaliacoes.remover).toHaveBeenCalledWith(9, 'user1', 'colega');
    expect(emitirEvento).toHaveBeenCalledWith({ tipo: 'avaliacao.removida', partidaId: 9, avaliadoDiscordId: 'colega' });
  });
});

describe('poderes do host sobre os inscritos', () => {
  beforeEach(() => {
    logadoComo('host1');
    // 3 vagas = o Monokuma (host) + 2 alunos: a sala está cheia, porque o Monokuma ocupa uma vaga.
    vi.mocked(repositorioPartidas.buscar).mockResolvedValue({ ...partida, vagas: 3 } as never);
    vi.mocked(repositorioPartidas.participantes).mockResolvedValue([
      { discordId: 'host1', tipo: 'participante', personagemId: 'monokuma' },
      { discordId: 'a', tipo: 'participante', personagemId: 'x' },
      { discordId: 'c', tipo: 'participante', personagemId: 'z' },
      { discordId: 'b', tipo: 'reserva', personagemId: null },
    ] as never);
  });

  it('só o host expulsa, e só de partida aberta', async () => {
    logadoComo('a');
    expect((await removerParticipanteAction(9, 'b')).ok).toBe(false);
    logadoComo('host1');
    comStatus('finalizada');
    expect(await removerParticipanteAction(9, 'b')).toEqual({ ok: false, erro: expect.stringContaining('já terminou') });
    expect(repositorioPartidas.sair).not.toHaveBeenCalled();
  });

  it('expulsar tira a pessoa e avisa o bot; quem não está na partida dá erro', async () => {
    expect((await removerParticipanteAction(9, 'b')).ok).toBe(true);
    expect(repositorioPartidas.sair).toHaveBeenCalledWith(9, 'b');
    expect(emitirEvento).toHaveBeenCalledWith({ tipo: 'inscricao.saiu', partidaId: 9, discordId: 'b' });
    expect(await removerParticipanteAction(9, 'fantasma')).toEqual({ ok: false, erro: expect.stringContaining('não está na partida') });
  });

  it('também vale com a partida em andamento', async () => {
    comStatus('em_andamento');
    expect((await removerParticipanteAction(9, 'b')).ok).toBe(true);
  });

  it('trocar o personagem de alguém mantém a vaga e avisa o bot', async () => {
    const r = await trocarInscricaoAction(9, 'a', 'kaede-akamatsu', 'participante');
    expect(r.ok).toBe(true);
    expect(repositorioPartidas.atualizarInscricao).toHaveBeenCalledWith(9, 'a', { personagemId: 'kaede-akamatsu', tipo: 'participante' });
    expect(emitirEvento).toHaveBeenCalledWith(expect.objectContaining({ tipo: 'inscricao.entrou', discordId: 'a', personagemId: 'kaede-akamatsu' }));
  });

  it('promover reserva a titular com a sala cheia é recusado; Monokuma só no host', async () => {
    expect(await trocarInscricaoAction(9, 'b', 'y', 'participante')).toEqual({ ok: false, erro: expect.stringContaining('vagas de titular') });
    expect(await trocarInscricaoAction(9, 'a', 'monokuma', 'participante')).toEqual({ ok: false, erro: expect.stringContaining('host') });
    expect(repositorioPartidas.atualizarInscricao).not.toHaveBeenCalled();
  });

  it('passar titular pra reserva libera a vaga', async () => {
    expect((await trocarInscricaoAction(9, 'a', 'x', 'reserva')).ok).toBe(true);
  });

  it('checklist de convidados: marca e desmarca (só o host)', async () => {
    expect((await marcarConvidadoAction(9, 'a', true)).ok).toBe(true);
    expect(repositorioPartidas.definirConvidado).toHaveBeenCalledWith(9, 'a', true);
    logadoComo('a');
    expect((await marcarConvidadoAction(9, 'b', true)).ok).toBe(false);
  });
});

describe('eventos de saída para o bot', () => {
  it('sair avisa o bot', async () => {
    await sairPartidaAction(9);
    expect(emitirEvento).toHaveBeenCalledWith({ tipo: 'inscricao.saiu', partidaId: 9, discordId: 'user1' });
  });
});
