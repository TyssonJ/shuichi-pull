import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  decidirModoLeve, lerSinaisDoAparelho, definirModoLeve, modoLeveAtivo, jaEscolheuModoLeve, SCRIPT_MODO_LEVE,
  CHAVE_MODO_LEVE, EVENTO_MODO_LEVE, aparelhoSofrendo, type SinaisDoAparelho,
} from './modo-leve';

const normal: SinaisDoAparelho = { reduzirMovimento: false, economiaDeDados: false, memoriaGB: 8, nucleos: 8 };

describe('decidirModoLeve', () => {
  it('a escolha guardada vence os sinais, nos dois sentidos', () => {
    expect(decidirModoLeve('1', normal)).toBe(true);
    expect(decidirModoLeve('0', { ...normal, reduzirMovimento: true, memoriaGB: 1 })).toBe(false);
  });

  it('sem escolha e aparelho bom: normal', () => {
    expect(decidirModoLeve(null, normal)).toBe(false);
    expect(decidirModoLeve('qualquer coisa', normal)).toBe(false);
  });

  it('sem escolha, cada sinal fraco liga o modo leve', () => {
    expect(decidirModoLeve(null, { ...normal, reduzirMovimento: true })).toBe(true);
    expect(decidirModoLeve(null, { ...normal, economiaDeDados: true })).toBe(true);
    expect(decidirModoLeve(null, { ...normal, memoriaGB: 2 })).toBe(true);
    expect(decidirModoLeve(null, { ...normal, nucleos: 2 })).toBe(true);
  });

  it('navegador que não informa memória/núcleos (null) não conta como fraco', () => {
    expect(decidirModoLeve(null, { ...normal, memoriaGB: null, nucleos: null })).toBe(false);
    expect(decidirModoLeve(null, { ...normal, memoriaGB: 4, nucleos: 4 })).toBe(false);
  });
});

/** Roda o script do <head> contra um "navegador" falso e devolve se ele ligou o modo leve. */
function rodarScript(cenario: { escolha?: string | null; sinais?: Partial<SinaisDoAparelho>; storageQuebrado?: boolean }): boolean {
  const s = { ...normal, ...cenario.sinais };
  const atributos = new Map<string, string>();
  const navigatorFalso: Record<string, unknown> = {
    connection: { saveData: s.economiaDeDados },
    ...(s.memoriaGB !== null ? { deviceMemory: s.memoriaGB } : {}),
    ...(s.nucleos !== null ? { hardwareConcurrency: s.nucleos } : {}),
  };
  const localStorageFalso = {
    getItem: (k: string) => {
      if (cenario.storageQuebrado) throw new Error('bloqueado');
      return k === CHAVE_MODO_LEVE ? cenario.escolha ?? null : null;
    },
  };
  const documentoFalso = { documentElement: { setAttribute: (k: string, v: string) => atributos.set(k, v) } };
  const matchMediaFalso = (q: string) => ({ matches: s.reduzirMovimento && q.includes('prefers-reduced-motion') });
  new Function('localStorage', 'navigator', 'document', 'window', 'matchMedia', SCRIPT_MODO_LEVE)(
    localStorageFalso, navigatorFalso, documentoFalso, { matchMedia: matchMediaFalso }, matchMediaFalso,
  );
  return atributos.get('data-leve') === '1';
}

describe('SCRIPT_MODO_LEVE (roda no <head>) decide igual a decidirModoLeve', () => {
  const escolhas = ['1', '0', null];
  const variacoes: Partial<SinaisDoAparelho>[] = [
    {}, { reduzirMovimento: true }, { economiaDeDados: true }, { memoriaGB: 2 }, { memoriaGB: 1 }, { memoriaGB: 4 },
    { nucleos: 2 }, { nucleos: 4 }, { memoriaGB: null, nucleos: null }, { memoriaGB: 2, nucleos: 2, reduzirMovimento: true },
  ];

  for (const escolha of escolhas) {
    for (const v of variacoes) {
      it(`escolha=${escolha} sinais=${JSON.stringify(v)}`, () => {
        expect(rodarScript({ escolha, sinais: v })).toBe(decidirModoLeve(escolha, { ...normal, ...v }));
      });
    }
  }

  it('localStorage bloqueado (modo privado) não quebra: cai nos sinais do aparelho', () => {
    expect(rodarScript({ storageQuebrado: true })).toBe(false);
    expect(rodarScript({ storageQuebrado: true, sinais: { reduzirMovimento: true } })).toBe(true);
  });

  it('é uma linha só e sem dependência de módulo (vai inline no HTML)', () => {
    expect(SCRIPT_MODO_LEVE).not.toContain('\n');
    expect(SCRIPT_MODO_LEVE).not.toMatch(/\bimport\b|\brequire\b/);
    expect(SCRIPT_MODO_LEVE.length).toBeLessThan(900);
  });
});

describe('no navegador', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-leve');
  });

  it('definirModoLeve liga: atributo, escolha guardada e evento', () => {
    const ouvinte = vi.fn();
    window.addEventListener(EVENTO_MODO_LEVE, ouvinte);
    expect(modoLeveAtivo()).toBe(false);
    expect(jaEscolheuModoLeve()).toBe(false);

    definirModoLeve(true);
    expect(modoLeveAtivo()).toBe(true);
    expect(document.documentElement.getAttribute('data-leve')).toBe('1');
    expect(localStorage.getItem(CHAVE_MODO_LEVE)).toBe('1');
    expect(jaEscolheuModoLeve()).toBe(true);
    expect(ouvinte).toHaveBeenCalledTimes(1);

    definirModoLeve(false);
    expect(modoLeveAtivo()).toBe(false);
    expect(document.documentElement.hasAttribute('data-leve')).toBe(false);
    expect(localStorage.getItem(CHAVE_MODO_LEVE)).toBe('0');
    expect(ouvinte).toHaveBeenCalledTimes(2);
    window.removeEventListener(EVENTO_MODO_LEVE, ouvinte);
  });

  it('lerSinaisDoAparelho lê o que o navegador informa (e null pro que ele não informa)', () => {
    const s = lerSinaisDoAparelho();
    expect(typeof s.reduzirMovimento).toBe('boolean');
    expect(s.economiaDeDados).toBe(false);
    expect(s.memoriaGB === null || typeof s.memoriaGB === 'number').toBe(true);
  });
});

describe('aparelhoSofrendo', () => {
  const quadros = (ms: number, n: number) => Array.from({ length: n }, () => ms);

  it('60 fps e 30 fps são confortáveis; 15 fps sofre', () => {
    expect(aparelhoSofrendo(quadros(16.7, 120))).toBe(false);
    expect(aparelhoSofrendo(quadros(33, 60))).toBe(false);
    expect(aparelhoSofrendo(quadros(66, 30))).toBe(true);
  });

  it('o limite é 25 fps (40 ms por quadro)', () => {
    expect(aparelhoSofrendo(quadros(39, 40))).toBe(false);
    expect(aparelhoSofrendo(quadros(45, 40))).toBe(true);
  });

  it('poucas amostras (aba oculta/congelada) não contam: nada é sugerido', () => {
    expect(aparelhoSofrendo([])).toBe(false);
    expect(aparelhoSofrendo(quadros(200, 10))).toBe(false);
  });

  it('os primeiros quadros (aquecimento) e valores inválidos são ignorados', () => {
    expect(aparelhoSofrendo([500, 500, 500, ...quadros(16, 40)])).toBe(false);
    expect(aparelhoSofrendo([...quadros(16, 40), Number.NaN, -5, 0])).toBe(false);
  });
});
