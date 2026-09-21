import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/db/repositorios/configuracoes', () => ({ repositorioConfiguracoes: { obter: vi.fn() } }));
vi.mock('@/db/repositorios/usuarios', () => ({
  repositorioUsuarios: { buscar: vi.fn(), definirStatusUuid: vi.fn(), existentes: vi.fn() },
}));
vi.mock('@/db/repositorios/partida-avaliacoes', () => ({
  repositorioPartidaAvaliacoes: { listarDoSiteParaOBot: vi.fn(), importarDoJunko: vi.fn() },
}));
vi.mock('@/db/repositorios/partidas', () => ({
  repositorioPartidas: {
    proximasAgendadas: vi.fn(), emAndamento: vi.fn(), participantes: vi.fn(), buscar: vi.fn(), entrar: vi.fn(), sair: vi.fn(), perfilDoUsuario: vi.fn(),
  },
}));
vi.mock('@/db/repositorios/auditoria', () => ({ repositorioAuditoria: { registrar: vi.fn() } }));
vi.mock('@/lib/dados-corrigidos', () => ({
  listarPersonagensComCorrecoes: vi.fn(async () => [{ id: 'shuichi-saihara' }]),
}));
vi.mock('@/lib/junko/servico', () => ({
  lerConfigEnvio: vi.fn(async () => ({ ativo: false, url: 'https://x.test', chave: null })),
}));

import { revalidatePath } from 'next/cache';
import { repositorioConfiguracoes } from '@/db/repositorios/configuracoes';
import { repositorioUsuarios } from '@/db/repositorios/usuarios';
import { repositorioPartidas } from '@/db/repositorios/partidas';
import { repositorioAuditoria } from '@/db/repositorios/auditoria';
import { repositorioPartidaAvaliacoes } from '@/db/repositorios/partida-avaliacoes';
import { gerarChave, hashDaChave } from '@/lib/junko/chave';
import { GET as statusGET } from './status/route';
import { GET as partidasGET } from './partidas/route';
import { GET as usuarioGET } from './usuarios/[discordId]/route';
import { POST as uidPOST } from './usuarios/[discordId]/uid/route';
import { POST as entrarPOST, DELETE as sairDELETE } from './partidas/[id]/inscricao/route';
import { GET as avaliacoesGET, POST as avaliacoesPOST } from './avaliacoes/route';

const chave = gerarChave();
const DISCORD = '123456789012345678';

const pedido = (corpo?: unknown, auth: string | null = `Bearer ${chave}`, metodo = 'POST') =>
  new Request('https://x.test/api/junko/x/', {
    method: metodo,
    headers: { ...(auth ? { authorization: auth } : {}), 'content-type': 'application/json' },
    body: corpo === undefined ? undefined : typeof corpo === 'string' ? corpo : JSON.stringify(corpo),
  });
const ctx = <T extends object>(p: T) => ({ params: Promise.resolve(p) });

const partida = { id: 5, titulo: 'Sala 5', hostDiscordId: '999999999999', dataHora: new Date('2026-09-22T00:00:00Z'), vagas: 2, status: 'agendada' };
const usuario = {
  discordId: DISCORD, discordNome: 'Tyson', uuidGmod: 'STEAM_0:1:1', uuidStatus: 'pendente', podeSerHost: true,
  mains: ['shuichi-saihara'], bio: 'oi',
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(repositorioConfiguracoes.obter).mockResolvedValue(hashDaChave(chave));
  vi.mocked(repositorioUsuarios.buscar).mockResolvedValue(usuario as never);
  vi.mocked(repositorioPartidas.buscar).mockResolvedValue(partida as never);
  vi.mocked(repositorioPartidas.participantes).mockResolvedValue([]);
  vi.mocked(repositorioPartidas.emAndamento).mockResolvedValue([]);
});

describe('autenticação em todas as rotas', () => {
  it('sem chave: 401, e nada é lido nem gravado', async () => {
    const semChave = pedido(undefined, null, 'GET');
    const respostas = await Promise.all([
      statusGET(semChave),
      partidasGET(semChave),
      usuarioGET(semChave, ctx({ discordId: DISCORD })),
      uidPOST(pedido({ status: 'banido' }, null), ctx({ discordId: DISCORD })),
      entrarPOST(pedido({ discordId: DISCORD }, null), ctx({ id: '5' })),
      sairDELETE(pedido({ discordId: DISCORD }, null, 'DELETE'), ctx({ id: '5' })),
      avaliacoesGET(semChave),
      avaliacoesPOST(pedido({ avaliacoes: [] }, null)),
    ]);
    expect(respostas.map((r) => r.status)).toEqual([401, 401, 401, 401, 401, 401, 401, 401]);
    expect(repositorioPartidaAvaliacoes.importarDoJunko).not.toHaveBeenCalled();
    expect(repositorioUsuarios.definirStatusUuid).not.toHaveBeenCalled();
    expect(repositorioPartidas.entrar).not.toHaveBeenCalled();
    expect(repositorioPartidas.sair).not.toHaveBeenCalled();
  });

  it('integração sem chave gerada: 503', async () => {
    vi.mocked(repositorioConfiguracoes.obter).mockResolvedValue(null);
    expect((await statusGET(pedido(undefined, `Bearer ${chave}`, 'GET'))).status).toBe(503);
  });
});

describe('GET /status', () => {
  it('confirma que a chave vale', async () => {
    const r = await statusGET(pedido(undefined, undefined, 'GET'));
    expect(await r.json()).toMatchObject({ ok: true, site: 'shuichipull', eventosAtivos: false });
  });
});

describe('GET /partidas', () => {
  it('lista as próximas com vagas e inscritos, sem contar reserva nem Monokuma como vaga', async () => {
    vi.mocked(repositorioPartidas.proximasAgendadas).mockResolvedValue([partida] as never);
    vi.mocked(repositorioPartidas.participantes).mockResolvedValue([
      { discordId: 'a', tipo: 'participante', personagemId: 'shuichi-saihara' },
      { discordId: 'b', tipo: 'reserva', personagemId: null },
      { discordId: 'h', tipo: 'participante', personagemId: 'monokuma' },
    ] as never);

    const corpo = await (await partidasGET(pedido(undefined, undefined, 'GET'))).json();

    expect(corpo.partidas).toHaveLength(1);
    expect(corpo.partidas[0]).toMatchObject({
      id: 5, vagas: 2, ocupadas: 1, reservas: 1, url: 'https://shuichipull.vercel.app/partidas/5/',
    });
    expect(corpo.partidas[0].inscritos).toHaveLength(3);
    expect(corpo.emAndamento).toEqual([]);
  });

  it('lista à parte as partidas em andamento, com início e status', async () => {
    vi.mocked(repositorioPartidas.proximasAgendadas).mockResolvedValue([]);
    vi.mocked(repositorioPartidas.emAndamento).mockResolvedValue([
      { ...partida, status: 'em_andamento', iniciadaEm: new Date('2026-09-22T00:05:00Z') },
    ] as never);

    const corpo = await (await partidasGET(pedido(undefined, undefined, 'GET'))).json();

    expect(corpo.partidas).toEqual([]);
    expect(corpo.emAndamento[0]).toMatchObject({ id: 5, status: 'em_andamento', iniciadaEm: '2026-09-22T00:05:00.000Z' });
  });
});

describe('GET /usuarios/[discordId]', () => {
  it('devolve o perfil com estatísticas', async () => {
    vi.mocked(repositorioPartidas.perfilDoUsuario).mockResolvedValue({ historico: [], estatisticas: { total: 3 } } as never);
    const r = await usuarioGET(pedido(undefined, undefined, 'GET'), ctx({ discordId: DISCORD }));
    expect(await r.json()).toMatchObject({ discordId: DISCORD, nome: 'Tyson', uid: 'STEAM_0:1:1', uidStatus: 'pendente', estatisticas: { total: 3 } });
  });

  it('quem nunca entrou no site: 404; id malformado: 400', async () => {
    vi.mocked(repositorioUsuarios.buscar).mockResolvedValue(null);
    expect((await usuarioGET(pedido(undefined, undefined, 'GET'), ctx({ discordId: DISCORD }))).status).toBe(404);
    expect((await usuarioGET(pedido(undefined, undefined, 'GET'), ctx({ discordId: "1' OR 1=1" }))).status).toBe(400);
  });
});

describe('POST /usuarios/[discordId]/uid', () => {
  it('muda o status, audita como junko-bot e revalida o painel', async () => {
    const r = await uidPOST(pedido({ status: 'aprovado' }), ctx({ discordId: DISCORD }));
    expect(r.status).toBe(200);
    expect(repositorioUsuarios.definirStatusUuid).toHaveBeenCalledWith(DISCORD, 'aprovado');
    expect(repositorioAuditoria.registrar).toHaveBeenCalledWith(expect.objectContaining({
      autor: 'junko-bot', acao: 'usuario.status_uuid', valorAntigo: 'pendente', valorNovo: 'aprovado',
    }));
    expect(revalidatePath).toHaveBeenCalledWith('/adm/usuarios');
  });

  it('status inválido e corpo que não é JSON: 400, sem gravar', async () => {
    expect((await uidPOST(pedido({ status: 'talvez' }), ctx({ discordId: DISCORD }))).status).toBe(400);
    expect((await uidPOST(pedido('{isso não é json'), ctx({ discordId: DISCORD }))).status).toBe(400);
    expect(repositorioUsuarios.definirStatusUuid).not.toHaveBeenCalled();
  });

  it('pessoa que nunca entrou no site: 404', async () => {
    vi.mocked(repositorioUsuarios.buscar).mockResolvedValue(null);
    expect((await uidPOST(pedido({ status: 'banido' }), ctx({ discordId: DISCORD }))).status).toBe(404);
  });
});

describe('POST /partidas/[id]/inscricao', () => {
  it('inscreve como titular por padrão e audita', async () => {
    const r = await entrarPOST(pedido({ discordId: DISCORD, personagemId: 'shuichi-saihara' }), ctx({ id: '5' }));
    expect(r.status).toBe(200);
    expect(repositorioPartidas.entrar).toHaveBeenCalledWith(5, DISCORD, 'shuichi-saihara', 'participante');
    expect(repositorioAuditoria.registrar).toHaveBeenCalledWith(expect.objectContaining({ autor: 'junko-bot', acao: 'partida.inscricao' }));
    expect(revalidatePath).toHaveBeenCalledWith('/partidas/5');
  });

  it('respeita as regras do site: sala cheia dá 409 e não grava', async () => {
    vi.mocked(repositorioPartidas.participantes).mockResolvedValue([
      { discordId: 'a', tipo: 'participante', personagemId: 'x' },
      { discordId: 'b', tipo: 'participante', personagemId: 'y' },
    ] as never);
    const r = await entrarPOST(pedido({ discordId: DISCORD }), ctx({ id: '5' }));
    expect(r.status).toBe(409);
    expect(repositorioPartidas.entrar).not.toHaveBeenCalled();
  });

  it('reserva entra mesmo com a sala cheia', async () => {
    vi.mocked(repositorioPartidas.participantes).mockResolvedValue([
      { discordId: 'a', tipo: 'participante', personagemId: 'x' },
      { discordId: 'b', tipo: 'participante', personagemId: 'y' },
    ] as never);
    const r = await entrarPOST(pedido({ discordId: DISCORD, tipo: 'reserva' }), ctx({ id: '5' }));
    expect(r.status).toBe(200);
  });

  it('Monokuma só pro host: 403 pra qualquer outra pessoa', async () => {
    const r = await entrarPOST(pedido({ discordId: DISCORD, personagemId: 'monokuma' }), ctx({ id: '5' }));
    expect(r.status).toBe(403);
  });

  it('partida que não aceita mais inscrição: 409; inexistente: 404', async () => {
    vi.mocked(repositorioPartidas.buscar).mockResolvedValue({ ...partida, status: 'finalizada' } as never);
    expect((await entrarPOST(pedido({ discordId: DISCORD }), ctx({ id: '5' }))).status).toBe(409);
    vi.mocked(repositorioPartidas.buscar).mockResolvedValue(null);
    expect((await entrarPOST(pedido({ discordId: DISCORD }), ctx({ id: '5' }))).status).toBe(404);
  });

  it('pessoa que nunca entrou no site: 404; personagem inexistente: 400; id de partida ruim: 400', async () => {
    vi.mocked(repositorioUsuarios.buscar).mockResolvedValueOnce(null);
    expect((await entrarPOST(pedido({ discordId: DISCORD }), ctx({ id: '5' }))).status).toBe(404);
    expect((await entrarPOST(pedido({ discordId: DISCORD, personagemId: 'fantasma' }), ctx({ id: '5' }))).status).toBe(400);
    expect((await entrarPOST(pedido({ discordId: DISCORD }), ctx({ id: 'abc' }))).status).toBe(400);
    expect(repositorioPartidas.entrar).not.toHaveBeenCalled();
  });
});

describe('DELETE /partidas/[id]/inscricao', () => {
  it('tira a pessoa e audita', async () => {
    const r = await sairDELETE(pedido({ discordId: DISCORD }, undefined, 'DELETE'), ctx({ id: '5' }));
    expect(r.status).toBe(200);
    expect(repositorioPartidas.sair).toHaveBeenCalledWith(5, DISCORD);
    expect(repositorioAuditoria.registrar).toHaveBeenCalledWith(expect.objectContaining({ acao: 'partida.saida' }));
  });

  it('partida inexistente: 404', async () => {
    vi.mocked(repositorioPartidas.buscar).mockResolvedValue(null);
    expect((await sairDELETE(pedido({ discordId: DISCORD }, undefined, 'DELETE'), ctx({ id: '5' }))).status).toBe(404);
  });
});

describe('GET /avaliacoes (site → bot)', () => {
  const linha = (id: number, dia: number) => ({
    id, partidaId: 5, avaliadoDiscordId: DISCORD, estrelas: 4, comentario: 'bom', criadoEm: new Date(`2026-09-${dia}T12:00:00Z`),
  });

  it('devolve as avaliações do site SEM o avaliador, com datas ISO', async () => {
    vi.mocked(repositorioPartidaAvaliacoes.listarDoSiteParaOBot).mockResolvedValue([linha(1, 10), linha(2, 11)]);
    const corpo = await (await avaliacoesGET(pedido(undefined, undefined, 'GET'))).json();
    expect(corpo.avaliacoes).toHaveLength(2);
    expect(corpo.avaliacoes[0]).toEqual({
      id: 1, partidaId: 5, avaliadoDiscordId: DISCORD, estrelas: 4, comentario: 'bom', criadoEm: '2026-09-10T12:00:00.000Z',
    });
    expect(JSON.stringify(corpo)).not.toMatch(/avaliador/i);
    expect(corpo.proximo).toBeNull();
  });

  it('página cheia devolve o cursor; desde e limite são repassados (limite tem teto)', async () => {
    vi.mocked(repositorioPartidaAvaliacoes.listarDoSiteParaOBot).mockResolvedValue([linha(1, 10), linha(2, 11)]);
    const req = new Request('https://x.test/api/junko/avaliacoes/?desde=2026-09-01T00:00:00Z&limite=2', {
      headers: { authorization: `Bearer ${chave}` },
    });
    const corpo = await (await avaliacoesGET(req)).json();
    expect(corpo.proximo).toBe('2026-09-11T12:00:00.000Z');
    expect(repositorioPartidaAvaliacoes.listarDoSiteParaOBot).toHaveBeenCalledWith(new Date('2026-09-01T00:00:00Z'), 2);

    await avaliacoesGET(new Request('https://x.test/api/junko/avaliacoes/?limite=99999', { headers: { authorization: `Bearer ${chave}` } }));
    expect(vi.mocked(repositorioPartidaAvaliacoes.listarDoSiteParaOBot).mock.calls.at(-1)?.[1]).toBe(200);
  });

  it('data inválida: 400', async () => {
    const req = new Request('https://x.test/api/junko/avaliacoes/?desde=ontem', { headers: { authorization: `Bearer ${chave}` } });
    expect((await avaliacoesGET(req)).status).toBe(400);
  });
});

describe('POST /avaliacoes (bot → site)', () => {
  const item = (extra: Record<string, unknown> = {}) => ({ externoId: 'b1', avaliadoDiscordId: DISCORD, estrelas: 5, comentario: 'ótimo', ...extra });

  it('importa as válidas, ignora as ruins com motivo e audita como junko-bot', async () => {
    vi.mocked(repositorioUsuarios.existentes).mockResolvedValue(new Set([DISCORD]));
    const r = await avaliacoesPOST(pedido({ avaliacoes: [item(), item({ externoId: 'b2', estrelas: 9 })] }));
    const corpo = await r.json();

    expect(r.status).toBe(200);
    expect(corpo.importadas).toBe(1);
    expect(corpo.ignoradas).toEqual([{ externoId: 'b2', motivo: expect.stringContaining('0 a 5') }]);
    expect(repositorioPartidaAvaliacoes.importarDoJunko).toHaveBeenCalledWith([
      expect.objectContaining({ externoId: 'b1', avaliadoDiscordId: DISCORD, estrelas: 5, comentario: 'ótimo' }),
    ]);
    expect(repositorioAuditoria.registrar).toHaveBeenCalledWith(expect.objectContaining({ autor: 'junko-bot', acao: 'junko.avaliacoes_importar' }));
    expect(revalidatePath).toHaveBeenCalledWith(`/u/${DISCORD}`);
  });

  it('avaliar quem nunca entrou no site é ignorado (e nada é gravado)', async () => {
    vi.mocked(repositorioUsuarios.existentes).mockResolvedValue(new Set());
    const corpo = await (await avaliacoesPOST(pedido({ avaliacoes: [item()] }))).json();
    expect(corpo.importadas).toBe(0);
    expect(corpo.ignoradas[0].motivo).toContain('ainda não entrou');
    expect(repositorioPartidaAvaliacoes.importarDoJunko).not.toHaveBeenCalled();
  });

  it('corpo sem a lista "avaliacoes" ou que não é JSON: 400', async () => {
    expect((await avaliacoesPOST(pedido({ outra: 1 }))).status).toBe(400);
    expect((await avaliacoesPOST(pedido('{quebrado'))).status).toBe(400);
  });
});
