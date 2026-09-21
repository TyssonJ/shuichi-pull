import { describe, it, expect } from 'vitest';
import { normalizarAvaliacoesExternas, LIMITE_LOTE_AVALIACOES } from './avaliacoes';

const A = '111111111111111111';
const B = '222222222222222222';
const conhecidos = new Set([A, B]);
const item = (extra: Record<string, unknown> = {}) => ({ externoId: 'r1', avaliadoDiscordId: A, estrelas: 4, ...extra });

describe('normalizarAvaliacoesExternas', () => {
  it('aceita nota + id; texto e avaliador são opcionais', () => {
    const { validas, ignoradas } = normalizarAvaliacoesExternas([item()], conhecidos);
    expect(ignoradas).toEqual([]);
    expect(validas).toEqual([{
      externoId: 'r1', avaliadoDiscordId: A, avaliadorDiscordId: null, estrelas: 4, comentario: null, criadoEm: null,
    }]);
  });

  it('aceita externoId numérico (vira texto) e data ISO', () => {
    const { validas } = normalizarAvaliacoesExternas(
      [item({ externoId: 42, criadoEm: '2026-09-21T15:00:00Z', comentario: '  ótimo jogador  ' })], conhecidos,
    );
    expect(validas[0]).toMatchObject({ externoId: '42', comentario: 'ótimo jogador' });
    expect(validas[0].criadoEm?.toISOString()).toBe('2026-09-21T15:00:00.000Z');
  });

  it('item inválido vai pra ignoradas com o motivo, sem derrubar os outros', () => {
    const { validas, ignoradas } = normalizarAvaliacoesExternas([
      item({ externoId: 'ok' }),
      item({ externoId: 'ruim', estrelas: 9 }),
      item({ externoId: 'sem-id-discord', avaliadoDiscordId: 'abc' }),
    ], conhecidos);
    expect(validas.map((v) => v.externoId)).toEqual(['ok']);
    expect(ignoradas).toHaveLength(2);
    expect(ignoradas[0]).toMatchObject({ externoId: 'ruim' });
    expect(ignoradas[0].motivo).toContain('0 a 5');
  });

  it('nota fracionada é rejeitada (não arredonda no escuro)', () => {
    const { validas, ignoradas } = normalizarAvaliacoesExternas([item({ estrelas: 3.5 })], conhecidos);
    expect(validas).toEqual([]);
    expect(ignoradas).toHaveLength(1);
  });

  it('avaliar quem nunca entrou no site e avaliar a si mesmo são ignorados', () => {
    const { validas, ignoradas } = normalizarAvaliacoesExternas([
      item({ externoId: 'a', avaliadoDiscordId: '333333333333333333' }),
      item({ externoId: 'b', avaliadorDiscordId: A }),
    ], conhecidos);
    expect(validas).toEqual([]);
    expect(ignoradas.map((i) => i.motivo)).toEqual([
      'a pessoa avaliada ainda não entrou no site', 'ninguém avalia a si mesmo',
    ]);
  });

  it('externoId repetido no lote: só o primeiro vale', () => {
    const { validas, ignoradas } = normalizarAvaliacoesExternas([item(), item({ estrelas: 1 })], conhecidos);
    expect(validas).toHaveLength(1);
    expect(validas[0].estrelas).toBe(4);
    expect(ignoradas[0].motivo).toContain('repetido');
  });

  it('corta texto acima de 300 caracteres em vez de recusar', () => {
    const { validas } = normalizarAvaliacoesExternas([item({ comentario: 'x'.repeat(500) })], conhecidos);
    expect(validas[0].comentario).toHaveLength(300);
  });

  it('não-lista e lote grande demais viram um aviso só', () => {
    expect(normalizarAvaliacoesExternas({ a: 1 }, conhecidos).ignoradas[0].motivo).toContain('lista');
    const grande = Array.from({ length: LIMITE_LOTE_AVALIACOES + 1 }, (_, i) => item({ externoId: String(i) }));
    const r = normalizarAvaliacoesExternas(grande, conhecidos);
    expect(r.validas).toEqual([]);
    expect(r.ignoradas[0].motivo).toContain(String(LIMITE_LOTE_AVALIACOES));
  });

  it('lixo no meio da lista não quebra nada', () => {
    const r = normalizarAvaliacoesExternas([null, 'texto', 7, item()], conhecidos);
    expect(r.validas).toHaveLength(1);
    expect(r.ignoradas).toHaveLength(3);
  });
});
