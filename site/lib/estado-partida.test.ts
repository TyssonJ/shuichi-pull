import { describe, it, expect } from 'vitest';
import { algumaMudou, estaEmMovimento, lerIds } from './estado-partida';

const tela = [{ id: 14, status: 'agendada', iniciadaEm: null }];

describe('algumaMudou', () => {
  it('igual ao servidor: nada a fazer', () => {
    expect(algumaMudou(tela, { '14': { status: 'agendada', iniciadaEm: null } })).toBe(false);
  });

  it('o host apertou "Começar": muda o status e o horário de início', () => {
    expect(algumaMudou(tela, { '14': { status: 'em_andamento', iniciadaEm: '2026-09-21T20:00:00.000Z' } })).toBe(true);
  });

  it('finalizou ou cancelou: muda', () => {
    const rolando = [{ id: 14, status: 'em_andamento', iniciadaEm: '2026-09-21T20:00:00.000Z' }];
    expect(algumaMudou(rolando, { '14': { status: 'finalizada', iniciadaEm: '2026-09-21T20:00:00.000Z' } })).toBe(true);
    expect(algumaMudou(tela, { '14': { status: 'cancelada', iniciadaEm: null } })).toBe(true);
  });

  it('partida ausente na resposta (apagada, ou erro) não dispara recarga em laço', () => {
    expect(algumaMudou(tela, {})).toBe(false);
    expect(algumaMudou(tela, { '14': undefined })).toBe(false);
  });

  it('várias na tela: basta uma ter mudado', () => {
    const lista = [{ id: 1, status: 'agendada', iniciadaEm: null }, { id: 2, status: 'agendada', iniciadaEm: null }];
    expect(algumaMudou(lista, {
      '1': { status: 'agendada', iniciadaEm: null }, '2': { status: 'em_andamento', iniciadaEm: '2026-09-21T20:00:00.000Z' },
    })).toBe(true);
  });
});

describe('estaEmMovimento', () => {
  it('só agendada e em andamento merecem ficar de olho', () => {
    expect(estaEmMovimento('agendada')).toBe(true);
    expect(estaEmMovimento('em_andamento')).toBe(true);
    expect(estaEmMovimento('finalizada')).toBe(false);
    expect(estaEmMovimento('cancelada')).toBe(false);
  });
});

describe('lerIds', () => {
  it('lê inteiros positivos, tira repetidos e lixo', () => {
    expect(lerIds('14,15, 14 ,abc,0,-3,1.5,,20')).toEqual([14, 15, 20]);
  });

  it('respeita o limite e devolve vazio sem texto', () => {
    expect(lerIds(Array.from({ length: 50 }, (_, i) => i + 1).join(','), 30)).toHaveLength(30);
    expect(lerIds(null)).toEqual([]);
    expect(lerIds('')).toEqual([]);
  });

  it('não aceita número gigante (passa do limite de 9 dígitos)', () => {
    expect(lerIds('1234567890,5')).toEqual([5]);
  });
});
