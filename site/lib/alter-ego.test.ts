import { describe, it, expect } from 'vitest';
import {
  faceDoEstado, falaDoEstado, secaoDoCaminho,
  falaDaSecao, falasDaSecao, kaomojiDaSecao, SECOES_EGO,
} from './alter-ego';

describe('faceDoEstado', () => {
  it('usa sprite quando o estado tem arte própria', () => {
    const f = faceDoEstado('ocioso');
    expect(f.tipo).toBe('sprite');
    expect(f.tipo === 'sprite' && f.src).toMatch(/\.webp$/);
  });

  it('usa kaomoji quando o estado não tem sprite', () => {
    expect(faceDoEstado('item-raro')).toEqual({ tipo: 'kaomoji', texto: '(・o・)' });
    expect(faceDoEstado('carregando')).toEqual({ tipo: 'kaomoji', texto: '(－ω－) zZ' });
    expect(faceDoEstado('erro-404')).toEqual({ tipo: 'kaomoji', texto: '(╥﹏╥)' });
  });

  it('cobre todos os estados sem quebrar', () => {
    const estados = ['ocioso','busca-com-resultado','busca-sem-resultado',
      'item-raro','primeira-visita','carregando','erro-404'] as const;
    for (const e of estados) expect(faceDoEstado(e)).toBeDefined();
  });
});

describe('falaDoEstado', () => {
  it('devolve a fala do estado', () => {
    expect(falaDoEstado('erro-404')).toBe('Essa página não existe...');
  });

  it('substitui variáveis na fala', () => {
    expect(falaDoEstado('busca-com-resultado', { n: 12 })).toBe('Achei 12 resultados!');
  });
});

describe('faceDoEstado com kaomoji forçado', () => {
  it('devolve kaomoji mesmo quando o estado tem sprite', () => {
    expect(faceDoEstado('ocioso', true)).toEqual({ tipo: 'kaomoji', texto: '(・‿・)' });
    expect(faceDoEstado('busca-com-resultado', true)).toEqual({ tipo: 'kaomoji', texto: '(◕‿◕)' });
  });

  it('continua usando sprite quando não é forçado', () => {
    expect(faceDoEstado('ocioso').tipo).toBe('sprite');
  });
});

describe('secaoDoCaminho', () => {
  it('reconhece a home', () => {
    expect(secaoDoCaminho('/')).toBe('home');
  });

  it('reconhece uma seção de listagem', () => {
    expect(secaoDoCaminho('/itens/')).toBe('itens');
  });

  it('reconhece uma ficha dentro da seção', () => {
    expect(secaoDoCaminho('/elenco/shuichi-saihara/')).toBe('elenco');
  });

  it('ignora ausência de barra final', () => {
    expect(secaoDoCaminho('/mapa')).toBe('mapa');
  });

  it('cai na home para caminho desconhecido', () => {
    expect(secaoDoCaminho('/nao-existe/')).toBe('home');
  });
});

describe('falaDaSecao', () => {
  it('sorteia a primeira fala quando o sorteio dá zero', () => {
    expect(falaDaSecao('itens', () => 0)).toBe(falasDaSecao('itens')[0]);
  });

  it('sorteia a última fala quando o sorteio quase chega em um', () => {
    const pool = falasDaSecao('mapa');
    expect(falaDaSecao('mapa', () => 0.999)).toBe(pool[pool.length - 1]);
  });

  it('toda seção tem pelo menos quatro falas e um kaomoji próprio', () => {
    for (const s of SECOES_EGO) {
      expect(falasDaSecao(s).length, `seção ${s}`).toBeGreaterThanOrEqual(4);
      expect(kaomojiDaSecao(s), `seção ${s}`).toBeTruthy();
    }
  });

  it('nunca devolve fala vazia', () => {
    for (const s of SECOES_EGO) {
      for (const fala of falasDaSecao(s)) expect(fala.trim()).not.toBe('');
    }
  });
});
