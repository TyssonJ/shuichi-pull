import { describe, it, expect } from 'vitest';
import {
  segmentosDeStatus, segmentosDeUid, atividadePorDia, descreverAcao, linhaDeLog,
} from './painel';

describe('segmentosDeStatus', () => {
  it('conta cada status, sempre nos quatro, mesmo zerados', () => {
    const s = segmentosDeStatus([
      { status: 'agendada' }, { status: 'agendada' }, { status: 'em_andamento' }, { status: 'cancelada' },
    ]);
    expect(s.map((x) => [x.rotulo, x.valor])).toEqual([
      ['Agendadas', 2], ['Em andamento', 1], ['Finalizadas', 0], ['Canceladas', 1],
    ]);
  });
});

describe('segmentosDeUid', () => {
  it('pendente só conta quem tem UID; quem não tem vai pra "Sem UID"', () => {
    const s = segmentosDeUid([
      { uuidGmod: 'STEAM_0:1:1', uuidStatus: 'aprovado' },
      { uuidGmod: 'STEAM_0:1:2', uuidStatus: 'pendente' },
      { uuidGmod: 'STEAM_0:1:3', uuidStatus: 'banido' },
      { uuidGmod: null, uuidStatus: 'pendente' },
    ]);
    expect(Object.fromEntries(s.map((x) => [x.rotulo, x.valor]))).toEqual({
      Aprovados: 1, Pendentes: 1, Banidos: 1, 'Sem UID': 1,
    });
  });
});

describe('atividadePorDia', () => {
  const agora = new Date('2026-09-21T15:00:00Z'); // 12:00 em Brasília

  it('devolve todos os dias, do mais antigo pro de hoje, com zero nos vazios', () => {
    const r = atividadePorDia([], 7, agora);
    expect(r).toHaveLength(7);
    expect(r[0].dia).toBe('2026-09-15');
    expect(r[6].dia).toBe('2026-09-21');
    expect(r[6].rotulo).toBe('21/09');
    expect(r.every((d) => d.total === 0)).toBe(true);
  });

  it('agrupa pelo dia de Brasília, não pelo UTC', () => {
    // 01:30 UTC de 21/09 ainda é 22:30 de 20/09 em Brasília.
    const r = atividadePorDia(
      [{ criadoEm: new Date('2026-09-21T01:30:00Z') }, { criadoEm: new Date('2026-09-21T14:00:00Z') }],
      3, agora,
    );
    expect(r.find((d) => d.dia === '2026-09-20')?.total).toBe(1);
    expect(r.find((d) => d.dia === '2026-09-21')?.total).toBe(1);
  });

  it('ignora o que caiu fora da janela', () => {
    const r = atividadePorDia([{ criadoEm: new Date('2026-08-01T12:00:00Z') }], 7, agora);
    expect(r.reduce((a, d) => a + d.total, 0)).toBe(0);
  });
});

describe('log do Alter Ego', () => {
  it('traduz as ações conhecidas e deixa passar as desconhecidas', () => {
    expect(descreverAcao('item.criar')).toBe('criou o item');
    expect(descreverAcao('adm.promover')).toBe('promoveu');
    expect(descreverAcao('coisa.nova')).toBe('coisa.nova');
  });

  it('monta a linha com hora de Brasília, nome do autor e detalhe', () => {
    const l = linhaDeLog(
      { criadoEm: new Date('2026-09-21T13:10:00Z'), autor: '9', acao: 'item.criar', alvo: 'espada', valorNovo: 'Espada' },
      new Map([['9', 'Tysson']]),
    );
    expect(l).toEqual({ hora: '21/09 10:10', autor: 'Tysson', texto: 'criou o item espada → Espada' });
  });

  it('sem nome conhecido mostra o id, e não repete o detalhe igual ao alvo', () => {
    const l = linhaDeLog(
      { criadoEm: new Date('2026-09-21T13:10:00Z'), autor: '9', acao: 'adm.rebaixar', alvo: '1', valorNovo: null },
      new Map(),
    );
    expect(l.autor).toBe('9');
    expect(l.texto).toBe('rebaixou 1');
  });
});
