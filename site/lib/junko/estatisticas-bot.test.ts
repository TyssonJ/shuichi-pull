import { describe, it, expect, vi } from 'vitest';
import { buscarPerfilDoBot, buscarRankingDoBot, ehCategoriaRanking } from './estatisticas-bot';

const BOT = 'https://bot.example';
const resposta = (corpo: unknown, status = 200) =>
  vi.fn().mockResolvedValue({ ok: status >= 200 && status < 300, status, json: async () => corpo }) as unknown as typeof fetch;

const perfilBruto = {
  user_id: '631190114504015892', uuid: '2387', jcoins: 905, partidas: 9, vitorias: 2, mvps: 1, mains: 'Mikan Tsumiki',
  fundo_equipado: 'Mikan1', cor_borda: '#EC417A', cor_titulo: '#EC417A', titulo_equipado: 'Sobrevivente Novato',
  last_daily: 1789893024, daily_streak: 13, discord_name: 'Fulano', discord_avatar: 'https://cdn.discordapp.com/a.png',
};

describe('buscarPerfilDoBot', () => {
  it('lê o perfil e chama a rota SEM barra no final (com barra o bot dá 404)', async () => {
    const buscar = resposta(perfilBruto);
    const r = await buscarPerfilDoBot(BOT, '631190114504015892', buscar);
    expect(vi.mocked(buscar).mock.calls[0][0]).toBe('https://bot.example/api/usuario/631190114504015892');
    expect(r).toEqual({
      ok: true,
      dados: {
        jcoins: 905, partidas: 9, vitorias: 2, mvps: 1, mains: 'Mikan Tsumiki', titulo: 'Sobrevivente Novato', corTitulo: '#EC417A',
        sequenciaDiaria: 13, ultimoDiarioEm: new Date(1789893024 * 1000).toISOString(),
      },
    });
  });

  it('não manda a credencial de saída do site (rota pública) e usa timeout e cache curto', async () => {
    const buscar = resposta(perfilBruto);
    await buscarPerfilDoBot(BOT, '631190114504015892', buscar);
    const init = vi.mocked(buscar).mock.calls[0][1] as RequestInit & { next?: { revalidate: number } };
    expect(JSON.stringify(init.headers)).not.toMatch(/authorization/i);
    expect(init.signal).toBeInstanceOf(AbortSignal);
    expect(init.next).toEqual({ revalidate: 60 });
    expect(init.redirect).toBe('manual');
  });

  it('pessoa que nunca usou o bot: nao-encontrado', async () => {
    expect(await buscarPerfilDoBot(BOT, '631190114504015892', resposta({ erro: 'x' }, 404))).toEqual({ ok: false, motivo: 'nao-encontrado' });
  });

  it('id que não é número nem chega a chamar o bot (nada de injetar caminho)', async () => {
    const buscar = resposta(perfilBruto);
    for (const ruim of ['../admin', '12', 'abc', '1/2', '']) {
      expect(await buscarPerfilDoBot(BOT, ruim, buscar)).toEqual({ ok: false, motivo: 'nao-encontrado' });
    }
    expect(buscar).not.toHaveBeenCalled();
  });

  it('bot fora do ar, com erro 5xx ou sem JSON: indisponivel / resposta-invalida, nunca lança', async () => {
    expect(await buscarPerfilDoBot(BOT, '631190114504015892', vi.fn().mockRejectedValue(new Error('rede')) as unknown as typeof fetch))
      .toEqual({ ok: false, motivo: 'indisponivel' });
    expect(await buscarPerfilDoBot(BOT, '631190114504015892', resposta({}, 502))).toEqual({ ok: false, motivo: 'indisponivel' });
    const semJson = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => { throw new Error('html'); } }) as unknown as typeof fetch;
    expect(await buscarPerfilDoBot(BOT, '631190114504015892', semJson)).toEqual({ ok: false, motivo: 'resposta-invalida' });
    expect(await buscarPerfilDoBot(BOT, '631190114504015892', resposta('texto'))).toEqual({ ok: false, motivo: 'resposta-invalida' });
  });

  it('campo estranho vira valor seguro: cor que não é #rrggbb some, número inválido vira 0, sem resgate diário = null', async () => {
    const r = await buscarPerfilDoBot(BOT, '631190114504015892', resposta({
      ...perfilBruto, cor_titulo: 'url(javascript:x)', jcoins: 'muitos', last_daily: 0, mains: '', titulo_equipado: null,
    }));
    expect(r).toMatchObject({ ok: true, dados: { corTitulo: null, jcoins: 0, ultimoDiarioEm: null, mains: null, titulo: null } });
  });
});

describe('buscarRankingDoBot', () => {
  it('lê o valor do campo certo de cada categoria e numera as posições', async () => {
    const riqueza = await buscarRankingDoBot(BOT, 'riqueza', resposta({
      categoria: 'riqueza', ranking: [{ user_id: '111111', jcoins: 910, discord_name: 'Ana' }, { user_id: '222222', jcoins: 905, discord_name: 'Bia' }],
    }));
    expect(riqueza).toEqual({ ok: true, dados: { categoria: 'riqueza', itens: [
      { posicao: 1, discordId: '111111', nome: 'Ana', valor: 910, partidas: null },
      { posicao: 2, discordId: '222222', nome: 'Bia', valor: 905, partidas: null },
    ] } });

    const vit = await buscarRankingDoBot(BOT, 'vitorias', resposta({ ranking: [{ user_id: '111111', vitorias: 3, partidas: 8, discord_name: 'Ana' }] }));
    expect(vit).toMatchObject({ ok: true, dados: { itens: [{ valor: 3, partidas: 8 }] } });

    // a categoria do bot se chama "assassinatos", mas o número que ele devolve é o de MVPs
    const mvp = await buscarRankingDoBot(BOT, 'assassinatos', resposta({ ranking: [{ user_id: '111111', mvps: 2, partidas: 8, discord_name: 'Ana' }] }));
    expect(mvp).toMatchObject({ ok: true, dados: { itens: [{ valor: 2 }] } });
  });

  it('chama a rota sem barra final', async () => {
    const buscar = resposta({ ranking: [] });
    await buscarRankingDoBot(BOT, 'vitorias', buscar);
    expect(vi.mocked(buscar).mock.calls[0][0]).toBe('https://bot.example/api/leaderboard/vitorias');
  });

  it('descarta item malformado sem derrubar a lista; renumera; limita a 20', async () => {
    const itens = [
      { user_id: '111111', jcoins: 5, discord_name: 'Ok' },
      { user_id: 'abc', jcoins: 4, discord_name: 'IdRuim' },
      { user_id: '333333', jcoins: 'x', discord_name: 'ValorRuim' },
      null,
      { user_id: '444444', jcoins: 3, discord_name: 'Ok2' },
      ...Array.from({ length: 30 }, (_, i) => ({ user_id: `9${i}99999`, jcoins: 1, discord_name: `x${i}` })),
    ];
    const r = await buscarRankingDoBot(BOT, 'riqueza', resposta({ ranking: itens }));
    expect(r.ok && r.dados.itens.slice(0, 2).map((i) => [i.posicao, i.nome])).toEqual([[1, 'Ok'], [2, 'Ok2']]);
    expect(r.ok && r.dados.itens.length).toBeLessThanOrEqual(20);
  });

  it('formato inesperado e falhas de rede', async () => {
    expect(await buscarRankingDoBot(BOT, 'riqueza', resposta({ ranking: 'x' }))).toEqual({ ok: false, motivo: 'resposta-invalida' });
    expect(await buscarRankingDoBot(BOT, 'riqueza', resposta([]))).toEqual({ ok: false, motivo: 'resposta-invalida' });
    expect(await buscarRankingDoBot(BOT, 'riqueza', vi.fn().mockRejectedValue(new Error('x')) as unknown as typeof fetch)).toEqual({ ok: false, motivo: 'indisponivel' });
  });
});

describe('ehCategoriaRanking', () => {
  it('só as três categorias que o bot conhece', () => {
    expect(['riqueza', 'vitorias', 'assassinatos'].every(ehCategoriaRanking)).toBe(true);
    expect(ehCategoriaRanking('partidas')).toBe(false);
    expect(ehCategoriaRanking('../x')).toBe(false);
  });
});
