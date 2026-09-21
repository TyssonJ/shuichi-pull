import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/db/repositorios/configuracoes', () => ({ repositorioConfiguracoes: { obter: vi.fn() } }));
vi.mock('@/db/repositorios/usuarios', () => ({
  repositorioUsuarios: { buscar: vi.fn(), definirStatusUuid: vi.fn() },
}));
vi.mock('@/db/repositorios/partidas', () => ({
  repositorioPartidas: {
    proximasAgendadas: vi.fn(), participantes: vi.fn(), buscar: vi.fn(), entrar: vi.fn(), sair: vi.fn(), perfilDoUsuario: vi.fn(),
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
import { gerarChave, hashDaChave } from '@/lib/junko/chave';
import { GET as statusGET } from './status/route';
import { GET as partidasGET } from './partidas/route';
import { GET as usuarioGET } from './usuarios/[discordId]/route';
import { POST as uidPOST } from './usuarios/[discordId]/uid/route';
import { POST as entrarPOST, DELETE as sairDELETE } from './partidas/[id]/inscricao/route';

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
    ]);
    expect(respostas.map((r) => r.status)).toEqual([401, 401, 401, 401, 401, 401]);
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
