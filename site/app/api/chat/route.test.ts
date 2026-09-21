import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/auth', () => ({ auth: vi.fn() }));
vi.mock('next/server', () => ({ after: vi.fn() }));
vi.mock('@/lib/chat-acesso', () => ({ podeAcessarSala: vi.fn() }));
vi.mock('@/lib/midia-servidor', () => ({ apagarMidia: vi.fn() }));
vi.mock('@/db/repositorios/chat', () => ({
  repositorioChat: {
    listar: vi.fn(), idsNaJanela: vi.fn(), marcarPresenca: vi.fn(), contarOnline: vi.fn(), purgar: vi.fn(), salasDePartida: vi.fn(),
  },
}));
vi.mock('@/db/repositorios/partidas', () => ({ repositorioPartidas: { listarAbertas: vi.fn() } }));
vi.mock('@/lib/dados-corrigidos', () => ({ listarPersonagensComCorrecoes: vi.fn() }));

import { auth } from '@/auth';
import { podeAcessarSala } from '@/lib/chat-acesso';
import { repositorioChat as repo } from '@/db/repositorios/chat';
import { repositorioPartidas } from '@/db/repositorios/partidas';
import { listarPersonagensComCorrecoes } from '@/lib/dados-corrigidos';
import { JANELA_ADM_MS, JANELA_JOGADOR_MS } from '@/lib/chat';
import { GET } from './route';
import { GET as GET_SALAS } from './salas/route';
import { GET as GET_PERSONAGENS } from './personagens/route';

const comum = { user: { discordId: '42', papel: null } };
const adm = { user: { discordId: '7', papel: 'adm' } };
const pedir = (query: string) => GET(new Request(`http://localhost/api/chat/${query}`));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(auth).mockResolvedValue(comum as never);
  vi.mocked(podeAcessarSala).mockResolvedValue(true);
  vi.mocked(repo.listar).mockResolvedValue([]);
  vi.mocked(repo.idsNaJanela).mockResolvedValue([]);
  vi.mocked(repo.contarOnline).mockResolvedValue(3);
});

describe('GET /api/chat', () => {
  it('sem login: 401; sala inválida: 400; sem acesso: 403', async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    expect((await pedir('?sala=geral')).status).toBe(401);
    vi.mocked(auth).mockResolvedValue(comum as never);
    expect((await pedir('?sala=xyz')).status).toBe(400);
    expect((await pedir('')).status).toBe(400);
    vi.mocked(podeAcessarSala).mockResolvedValue(false);
    expect((await pedir('?sala=partida:5')).status).toBe(403);
    expect(repo.listar).not.toHaveBeenCalled();
  });

  it('devolve mensagens com a identidade do autor, online e ids; marca presença', async () => {
    vi.mocked(repo.listar).mockResolvedValue([{
      id: 5, sala: 'geral', autorDiscordId: '9', texto: 'oi', anexos: [], criadoEm: new Date('2026-09-21T15:00:00Z'),
      autor: { discordNome: 'Ana#1', discordAvatar: 'https://cdn/a.png', apelido: 'Aninha', avatarUrl: null, ehAdm: true },
    }]);
    vi.mocked(repo.idsNaJanela).mockResolvedValue([5]);

    const r = await pedir('?sala=geral');
    expect(r.headers.get('cache-control')).toBe('no-store');
    expect(await r.json()).toEqual({
      online: 3,
      ids: [5],
      mensagens: [{
        id: 5, autorId: '9', autorNome: 'Aninha', autorNomeOriginal: 'Ana#1', autorAvatar: 'https://cdn/a.png', autorEhAdm: true,
        texto: 'oi', anexos: [], criadoEm: '2026-09-21T15:00:00.000Z',
      }],
    });
    expect(repo.marcarPresenca).toHaveBeenCalledWith('42', 'geral', expect.any(Date));
  });

  it('jogador enxerga 4 h; ADM, 24 h', async () => {
    await pedir('?sala=geral');
    const desdeJogador = vi.mocked(repo.listar).mock.calls[0][1].desde.getTime();
    vi.mocked(auth).mockResolvedValue(adm as never);
    await pedir('?sala=geral');
    const desdeAdm = vi.mocked(repo.listar).mock.calls[1][1].desde.getTime();
    // As duas consultas rodam quase juntas: a diferença entre as janelas é a diferença entre 24 h e 4 h.
    expect(Math.abs((desdeJogador - desdeAdm) - (JANELA_ADM_MS - JANELA_JOGADOR_MS))).toBeLessThan(2000);
  });

  it('`depois` só vale se for número; vai como filtro de "só as novas"', async () => {
    await pedir('?sala=geral&depois=12');
    expect(vi.mocked(repo.listar).mock.calls[0][1].depoisDe).toBe(12);
    await pedir('?sala=geral&depois=abc');
    expect(vi.mocked(repo.listar).mock.calls[1][1].depoisDe).toBeUndefined();
  });
});

describe('GET /api/chat/salas', () => {
  it('sem login: 401 (é o que esconde o botão)', async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    expect((await GET_SALAS()).status).toBe(401);
  });

  it('jogador: geral + as partidas dele', async () => {
    vi.mocked(repo.salasDePartida).mockResolvedValue([{ id: 5, titulo: 'Noite de terror', status: 'agendada' }]);
    expect(await (await GET_SALAS()).json()).toEqual({
      eu: '42', ehAdm: false,
      salas: [{ id: 'geral', nome: 'GERAL' }, { id: 'partida:5', nome: 'Noite de terror' }],
    });
  });

  it('ADM: geral + toda partida em aberto (nem cancelada nem finalizada)', async () => {
    vi.mocked(auth).mockResolvedValue(adm as never);
    vi.mocked(repositorioPartidas.listarAbertas).mockResolvedValue([
      { id: 1, titulo: 'A', status: 'agendada' }, { id: 2, titulo: 'B', status: 'finalizada' }, { id: 3, titulo: 'C', status: 'em_andamento' },
    ] as never);
    const j = await (await GET_SALAS()).json();
    expect(j.salas.map((s: { id: string }) => s.id)).toEqual(['geral', 'partida:1', 'partida:3']);
  });
});

describe('GET /api/chat/personagens', () => {
  it('sem login: 401; logado: elenco com cor legível (do sprite ou derivada do id)', async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    expect((await GET_PERSONAGENS()).status).toBe(401);

    vi.mocked(auth).mockResolvedValue(comum as never);
    vi.mocked(listarPersonagensComCorrecoes).mockResolvedValue([
      { id: 'makoto-naegi', nome: 'Makoto Naegi' }, { id: 'personagem-do-adm', nome: 'Novo' },
    ] as never);
    const j = await (await GET_PERSONAGENS()).json();
    expect(j.personagens).toHaveLength(2);
    for (const p of j.personagens) expect(p.cor).toMatch(/^#[0-9a-f]{6}$/);
    expect(j.personagens[0]).toMatchObject({ id: 'makoto-naegi', nome: 'Makoto Naegi' });
  });
});
