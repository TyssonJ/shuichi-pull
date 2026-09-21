import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { deslocamentoDaAmostra, melhorAmostra, IDA_E_VOLTA_BOA_MS } from './relogio';
import {
  agoraSincronizado, garantirSincronia, sincronizarRelogio, reiniciarRelogio, relogioJaSincronizado, CAMINHO_HORA,
} from './relogio-cliente';
import { formatarCronometro } from './status-partida';

describe('deslocamentoDaAmostra', () => {
  it('relógio certo e rede instantânea: diferença zero', () => {
    expect(deslocamentoDaAmostra({ servidorMs: 1_000_000, idaEVoltaMs: 0, aparelhoNaChegadaMs: 1_000_000 })).toBe(0);
  });

  it('aparelho ATRASADO em 2 min: soma 2 min pra chegar na hora do servidor', () => {
    expect(deslocamentoDaAmostra({ servidorMs: 1_000_000, idaEVoltaMs: 0, aparelhoNaChegadaMs: 1_000_000 - 120_000 })).toBe(120_000);
  });

  it('aparelho ADIANTADO em 30 s: desloca pra trás', () => {
    expect(deslocamentoDaAmostra({ servidorMs: 1_000_000, idaEVoltaMs: 0, aparelhoNaChegadaMs: 1_030_000 })).toBe(-30_000);
  });

  it('compensa metade da viagem: com 200 ms de ida e volta, o servidor já está 100 ms à frente', () => {
    expect(deslocamentoDaAmostra({ servidorMs: 1_000_000, idaEVoltaMs: 200, aparelhoNaChegadaMs: 1_000_000 })).toBe(100);
  });
});

describe('melhorAmostra', () => {
  const a = (idaEVoltaMs: number) => ({ servidorMs: 1, idaEVoltaMs, aparelhoNaChegadaMs: 1 });

  it('escolhe a de menor ida e volta, ignora inválidas e devolve null sem nenhuma', () => {
    expect(melhorAmostra([a(300), a(80), a(120)])?.idaEVoltaMs).toBe(80);
    expect(melhorAmostra([a(-5), a(Number.NaN), { servidorMs: Number.NaN, idaEVoltaMs: 10, aparelhoNaChegadaMs: 1 }])).toBeNull();
    expect(melhorAmostra([])).toBeNull();
  });
});

describe('relógio sincronizado do navegador', () => {
  let agoraDoAparelho: number;
  let agoraRelogioMonotonico: number;

  beforeEach(() => {
    reiniciarRelogio();
    agoraDoAparelho = 5_000_000;
    agoraRelogioMonotonico = 0;
    vi.spyOn(Date, 'now').mockImplementation(() => agoraDoAparelho);
    vi.spyOn(performance, 'now').mockImplementation(() => agoraRelogioMonotonico);
  });
  afterEach(() => vi.restoreAllMocks());

  /** Servidor à frente do aparelho em `diferenca` ms; cada ida e volta demora `viagem` ms. */
  function servidorFalso(diferenca: number, viagem: number) {
    return vi.fn(async () => {
      agoraRelogioMonotonico += viagem;
      agoraDoAparelho += viagem;
      return { ok: true, json: async () => ({ agora: agoraDoAparelho - viagem / 2 + diferenca }) } as Response;
    }) as unknown as typeof fetch;
  }

  it('sem medição usa o relógio do aparelho, como antes', () => {
    expect(agoraSincronizado()).toBe(agoraDoAparelho);
    expect(relogioJaSincronizado()).toBe(false);
  });

  it('BUG ORIGINAL: aparelho 2 min atrasado mostrava 00:00:00 parado; sincronizado mostra o tempo certo', async () => {
    const inicioDaPartida = agoraDoAparelho + 120_000 - 65_000; // o host apertou "Começar" há 65 s (hora do servidor)
    // sem sincronizar: o aparelho acha que a partida começa no FUTURO → cronômetro travado em zero
    expect(formatarCronometro(agoraSincronizado() - inicioDaPartida)).toBe('00:00:00');

    await sincronizarRelogio(servidorFalso(120_000, 40));
    expect(formatarCronometro(agoraSincronizado() - inicioDaPartida)).toBe('00:01:05');
  });

  it('aparelho adiantado também é corrigido (todo mundo vê o mesmo tempo)', async () => {
    const inicioDaPartida = agoraDoAparelho - 30_000 - 65_000;
    expect(formatarCronometro(agoraSincronizado() - inicioDaPartida)).toBe('00:01:35'); // errado: 30 s a mais
    await sincronizarRelogio(servidorFalso(-30_000, 40));
    expect(formatarCronometro(agoraSincronizado() - inicioDaPartida)).toBe('00:01:05');
  });

  it('para cedo quando a ida e volta é boa; com rede lenta, tenta até 3 vezes e usa a melhor', async () => {
    const rapido = servidorFalso(1000, IDA_E_VOLTA_BOA_MS - 50);
    await sincronizarRelogio(rapido);
    expect(rapido).toHaveBeenCalledTimes(1);

    reiniciarRelogio();
    const lento = servidorFalso(1000, 900);
    await sincronizarRelogio(lento);
    expect(lento).toHaveBeenCalledTimes(3);
    expect(lento).toHaveBeenCalledWith(CAMINHO_HORA, { cache: 'no-store' });
  });

  it('falha de rede, resposta ruim ou sem "agora": nunca lança e mantém o relógio do aparelho', async () => {
    await sincronizarRelogio(vi.fn().mockRejectedValue(new Error('sem rede')) as unknown as typeof fetch);
    await sincronizarRelogio(vi.fn().mockResolvedValue({ ok: false }) as unknown as typeof fetch);
    await sincronizarRelogio(vi.fn().mockResolvedValue({ ok: true, json: async () => ({ agora: 'x' }) }) as unknown as typeof fetch);
    expect(agoraSincronizado()).toBe(agoraDoAparelho);
    expect(relogioJaSincronizado()).toBe(false);
  });

  it('garantirSincronia divide a mesma medição entre quem pede junto e não repete antes de 10 min', async () => {
    const buscar = servidorFalso(500, 40);
    await Promise.all([garantirSincronia(buscar), garantirSincronia(buscar), garantirSincronia(buscar)]);
    expect(buscar).toHaveBeenCalledTimes(1);
    expect(relogioJaSincronizado()).toBe(true);

    await garantirSincronia(buscar);
    expect(buscar).toHaveBeenCalledTimes(1);

    agoraDoAparelho += 11 * 60 * 1000; // passou o prazo: mede de novo
    await garantirSincronia(buscar);
    expect(buscar).toHaveBeenCalledTimes(2);
  });

  it('garantirSincronia nunca rejeita, mesmo com o fetch quebrado', async () => {
    await expect(garantirSincronia(vi.fn().mockRejectedValue(new Error('x')) as unknown as typeof fetch)).resolves.toBeUndefined();
  });
});
