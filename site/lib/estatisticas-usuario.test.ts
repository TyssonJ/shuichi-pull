import { describe, it, expect } from 'vitest';
import {
  calcularEstatisticas, desfechoParaUsuario, foiBlackened,
  type PartidaParaStats, type CapituloParaStats,
} from './estatisticas-usuario';

const EU = 'eu';
const OUTRO = 'outro';

const partida = (id: number, extra: Partial<PartidaParaStats> = {}): PartidaParaStats => ({
  id, blackened: null, mvpDiscordIds: [], resultado: null, ...extra,
});
const cap = (partidaId: number, extra: Partial<CapituloParaStats> = {}): CapituloParaStats => ({
  partidaId, assassinoDiscordId: null, vitimaDiscordId: null, afk: [], ...extra,
});

describe('foiBlackened', () => {
  it('conta o blackened do resumo', () => {
    expect(foiBlackened(EU, partida(1, { blackened: EU }), [])).toBe(true);
  });

  it('conta o assassino de um capítulo mesmo sem blackened no resumo', () => {
    expect(foiBlackened(EU, partida(1), [cap(1, { assassinoDiscordId: EU })])).toBe(true);
  });

  it('capítulo de outra partida não conta', () => {
    expect(foiBlackened(EU, partida(1), [cap(2, { assassinoDiscordId: EU })])).toBe(false);
  });
});

describe('desfechoParaUsuario', () => {
  it('vitória dos alunos: inocente vence, culpado perde', () => {
    const p = partida(1, { resultado: 'vitoria_alunos', blackened: OUTRO });
    expect(desfechoParaUsuario(EU, p, [])).toBe('vitoria');
    expect(desfechoParaUsuario(OUTRO, p, [])).toBe('derrota');
  });

  it('vitória do assassino: culpado vence, inocente perde', () => {
    const p = partida(1, { resultado: 'vitoria_mestre', blackened: EU });
    expect(desfechoParaUsuario(EU, p, [])).toBe('vitoria');
    expect(desfechoParaUsuario(OUTRO, p, [])).toBe('derrota');
  });

  it('tragédia não é vitória nem derrota pra ninguém', () => {
    expect(desfechoParaUsuario(EU, partida(1, { resultado: 'tragedia', blackened: EU }), [])).toBe('tragedia');
  });

  it('sem desfecho no relatório devolve null', () => {
    expect(desfechoParaUsuario(EU, partida(1), [])).toBeNull();
  });
});

describe('calcularEstatisticas', () => {
  it('sem partida nenhuma, tudo zero', () => {
    expect(calcularEstatisticas(EU, [], [])).toEqual({
      total: 0, vitorias: 0, derrotas: 0, tragedias: 0, comoBlackened: 0, comoDetetive: 0,
      casosResolvidos: 0, mvps: 0, assassinado: 0, afk: 0,
    });
  });

  it('soma vitórias, derrotas, tragédias e papéis', () => {
    const partidas = [
      partida(1, { resultado: 'vitoria_alunos', blackened: OUTRO }),   // detetive, venceu, caso resolvido
      partida(2, { resultado: 'vitoria_alunos', blackened: EU }),      // culpado, perdeu
      partida(3, { resultado: 'vitoria_mestre', blackened: EU }),      // culpado, venceu
      partida(4, { resultado: 'vitoria_mestre', blackened: OUTRO }),   // detetive, perdeu
      partida(5, { resultado: 'tragedia' }),
      partida(6),                                                      // sem relatório
    ];
    const e = calcularEstatisticas(EU, partidas, []);
    expect(e).toMatchObject({
      total: 6, vitorias: 2, derrotas: 2, tragedias: 1,
      comoBlackened: 2, comoDetetive: 4, casosResolvidos: 1,
    });
  });

  it('vitória como culpado não é caso resolvido', () => {
    const e = calcularEstatisticas(EU, [partida(1, { resultado: 'vitoria_mestre', blackened: EU })], []);
    expect(e.vitorias).toBe(1);
    expect(e.casosResolvidos).toBe(0);
  });

  it('MVP, assassinado e AFK vêm do relatório e contam uma vez por partida', () => {
    const partidas = [partida(1, { mvpDiscordIds: [EU, OUTRO] }), partida(2)];
    const capitulos = [
      cap(1, { vitimaDiscordId: EU }), cap(1, { vitimaDiscordId: EU, afk: [EU] }),
      cap(2, { afk: [OUTRO] }),
    ];
    const e = calcularEstatisticas(EU, partidas, capitulos);
    expect(e.mvps).toBe(1);
    expect(e.assassinado).toBe(1);
    expect(e.afk).toBe(1);
  });

  it('o assassino de capítulo entra como blackened e decide o resultado', () => {
    const partidas = [partida(1, { resultado: 'vitoria_mestre' })];
    const e = calcularEstatisticas(EU, partidas, [cap(1, { assassinoDiscordId: EU })]);
    expect(e.comoBlackened).toBe(1);
    expect(e.vitorias).toBe(1);
  });
});
