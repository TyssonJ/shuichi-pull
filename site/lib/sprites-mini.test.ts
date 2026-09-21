import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { miniaturaDoSprite } from './sprites-mini';

const RAIZ = path.join(process.cwd(), 'public', 'sprites');

describe('miniaturaDoSprite', () => {
  it('troca só os sprites do nosso elenco pela miniatura', () => {
    expect(miniaturaDoSprite('/sprites/elenco/makoto-naegi.webp')).toBe('/sprites/elenco-mini/makoto-naegi.webp');
  });

  it('não mexe na silhueta, no corpo inteiro, no pixel nem em links de fora', () => {
    for (const src of [
      '/sprites/silhueta.svg', '/sprites/fullbody/makoto-naegi.webp', '/sprites/pixel/makoto-naegi.png',
      'https://i.imgur.com/x.png', 'https://abc.public.blob.vercel-storage.com/imagem/a.webp', '',
    ]) expect(miniaturaDoSprite(src)).toBe(src);
  });
});

describe('miniaturas geradas', () => {
  it('todo sprite do elenco tem a sua miniatura (rode scripts/gerar-miniaturas.mjs se falhar)', () => {
    const originais = fs.readdirSync(path.join(RAIZ, 'elenco')).filter((a) => a.endsWith('.webp'));
    const minis = new Set(fs.readdirSync(path.join(RAIZ, 'elenco-mini')));
    const faltando = originais.filter((a) => !minis.has(a));
    expect(faltando).toEqual([]);
  });

  it('a miniatura é bem mais leve que o original (senão não valeu a pena)', () => {
    const tamanho = (pasta: string) => fs.readdirSync(path.join(RAIZ, pasta))
      .reduce((n, a) => n + fs.statSync(path.join(RAIZ, pasta, a)).size, 0);
    expect(tamanho('elenco-mini')).toBeLessThan(tamanho('elenco') * 0.5);
  });
});
