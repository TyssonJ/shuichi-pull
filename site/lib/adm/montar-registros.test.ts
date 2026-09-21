import { describe, it, expect } from 'vitest';
import { montarRegistrosDoGuia, montarRegistrosNovos } from './montar-registros';
import type { MapaCorrecoes } from '@/lib/correcoes-merge';

const campos = [
  { rotulo: 'Pergunta', caminho: 'pergunta' },
  { rotulo: 'Talento', caminho: 'talento.pt' },
];
const base = [
  { id: 'a', secao: 'Regras', pergunta: 'Original A?', talento: { pt: 'Detetive' } },
  { id: 'b', secao: 'Modos', pergunta: 'Original B?' },
];

describe('montarRegistrosDoGuia', () => {
  it('sem correções: valores = originais, não alterado', () => {
    const [a] = montarRegistrosDoGuia(base, campos, new Map(), 'pergunta', 'secao');
    expect(a).toMatchObject({
      id: 'a', titulo: 'Original A?', grupo: 'Regras', origem: 'guia', alterado: false,
      valores: { pergunta: 'Original A?', 'talento.pt': 'Detetive' },
      originais: { pergunta: 'Original A?', 'talento.pt': 'Detetive' },
    });
  });

  it('correção vira o valor atual, mantém o original e marca alterado', () => {
    const correcoes: MapaCorrecoes = new Map([
      ['a', new Map([['pergunta', { valor: 'Nova A?', valorBase: 'Original A?', autor: '1', criadoEm: 'x' }]])],
    ]);
    const [a, b] = montarRegistrosDoGuia(base, campos, correcoes, 'pergunta', 'secao');
    expect(a).toMatchObject({ titulo: 'Nova A?', alterado: true });
    expect(a.originais?.pergunta).toBe('Original A?');
    expect(b.alterado).toBe(false);
  });

  it('campo ausente no guia vira string vazia (dá pra preencher no editor)', () => {
    const [, b] = montarRegistrosDoGuia(base, campos, new Map(), 'pergunta');
    expect(b.valores['talento.pt']).toBe('');
    expect(b.grupo).toBeNull();
  });
});

describe('montarRegistrosNovos', () => {
  it('monta registros criados, sem originais', () => {
    const [n] = montarRegistrosNovos('faq', [{ id: 'x', dados: { secao: 'S', pergunta: 'P?', resposta: 'R' } }], 'pergunta', 'secao');
    expect(n).toMatchObject({
      id: 'x', titulo: 'P?', grupo: 'S', origem: 'novo', alterado: false, originais: null,
      valores: { secao: 'S', pergunta: 'P?', resposta: 'R' },
    });
  });
});
