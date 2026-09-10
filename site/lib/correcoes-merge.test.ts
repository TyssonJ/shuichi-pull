import { describe, it, expect } from 'vitest';
import { obterCaminho, definirCaminho, aplicarCorrecoes, type MapaCorrecoes } from './correcoes-merge';

describe('obterCaminho', () => {
  it('lê um campo de primeiro nível', () => {
    expect(obterCaminho({ nome: 'Makoto' }, 'nome')).toBe('Makoto');
  });

  it('lê um campo aninhado', () => {
    expect(obterCaminho({ descricao: { pt: 'oi', en: 'hi' } }, 'descricao.pt')).toBe('oi');
  });

  it('devolve null quando o caminho não existe', () => {
    expect(obterCaminho({ descricao: null }, 'descricao.pt')).toBeNull();
  });
});

describe('definirCaminho', () => {
  it('escreve um campo de primeiro nível sem mutar o original', () => {
    const original = { nome: 'Makoto' };
    const resultado = definirCaminho(original, 'nome', 'Outro nome');

    expect(resultado.nome).toBe('Outro nome');
    expect(original.nome).toBe('Makoto');
  });

  it('escreve um campo aninhado existente', () => {
    const original = { descricao: { pt: 'oi', en: 'hi' } };
    const resultado = definirCaminho(original, 'descricao.pt', 'novo');

    expect(resultado.descricao).toEqual({ pt: 'novo', en: 'hi' });
  });

  it('cria o objeto intermediário quando o campo base é null', () => {
    const original: { descricao: { pt: string; en: string } | null } = { descricao: null };
    const resultado = definirCaminho(original, 'descricao.pt', 'novo');

    expect(resultado.descricao).toEqual({ pt: 'novo' });
  });
});

describe('aplicarCorrecoes', () => {
  it('devolve os registros sem alteração quando não há correções', () => {
    const registros = [{ id: 'a', nome: 'Original' }];
    const correcoes: MapaCorrecoes = new Map();

    expect(aplicarCorrecoes(registros, correcoes)).toEqual(registros);
  });

  it('aplica a correção por cima do registro certo', () => {
    const registros = [{ id: 'a', nome: 'Original' }, { id: 'b', nome: 'Outro' }];
    const correcoes: MapaCorrecoes = new Map([
      ['a', new Map([['nome', { valor: 'Corrigido', valorBase: 'Original', autor: '1', criadoEm: '2026-01-01' }]])],
    ]);

    const resultado = aplicarCorrecoes(registros, correcoes);

    expect(resultado[0].nome).toBe('Corrigido');
    expect(resultado[1].nome).toBe('Outro');
  });

  it('não muta o array original', () => {
    const registros = [{ id: 'a', nome: 'Original' }];
    const correcoes: MapaCorrecoes = new Map([
      ['a', new Map([['nome', { valor: 'Corrigido', valorBase: 'Original', autor: '1', criadoEm: '2026-01-01' }]])],
    ]);

    aplicarCorrecoes(registros, correcoes);

    expect(registros[0].nome).toBe('Original');
  });
});
