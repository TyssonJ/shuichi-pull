import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { spritePixelDe, IDS_COM_PIXEL, iconeDoInscrito } from './sprites-pixel';
import { listarPersonagens } from './dados';
import { SPRITE_MONOKUMA, ID_MONOKUMA } from './monokuma';

const PASTA = path.join(process.cwd(), 'public', 'sprites', 'pixel');
const SEM_PIXEL_NA_WIKI = ['ryoko-otonashi'];

describe('sprites 8-bit', () => {
  it('todo id da lista tem o arquivo na pasta', () => {
    for (const id of IDS_COM_PIXEL) {
      expect(existsSync(path.join(PASTA, `${id}.png`)), id).toBe(true);
    }
  });

  it('todo arquivo da pasta (menos o Monokuma) está na lista', () => {
    const arquivos = readdirSync(PASTA)
      .filter((f) => f.endsWith('.png'))
      .map((f) => f.replace('.png', ''))
      .filter((id) => id !== 'monokuma');
    expect([...arquivos].sort()).toEqual([...IDS_COM_PIXEL].sort());
  });

  it('todo personagem do elenco tem sprite, exceto os sem pixel na wiki', () => {
    const faltando = listarPersonagens()
      .map((p) => p.id)
      .filter((id) => !spritePixelDe(id) && !SEM_PIXEL_NA_WIKI.includes(id));
    expect(faltando).toEqual([]);
  });

  it('devolve null pra quem não tem e o caminho público pra quem tem', () => {
    expect(spritePixelDe('ryoko-otonashi')).toBeNull();
    expect(spritePixelDe('makoto-naegi')).toBe('/sprites/pixel/makoto-naegi.png');
  });

  it('o Monokuma tem sprite na pasta', () => {
    expect(existsSync(path.join(PASTA, 'monokuma.png'))).toBe(true);
    expect(SPRITE_MONOKUMA).toBe('/sprites/pixel/monokuma.png');
  });

  it('iconeDoInscrito: pixel, depois retrato, depois vaga genérica', () => {
    const retratos = new Map([['ryoko-otonashi', '/sprites/elenco/ryoko-otonashi.webp']]);
    expect(iconeDoInscrito('makoto-naegi', retratos)).toBe('/sprites/pixel/makoto-naegi.png');
    expect(iconeDoInscrito('ryoko-otonashi', retratos)).toBe('/sprites/elenco/ryoko-otonashi.webp');
    expect(iconeDoInscrito(ID_MONOKUMA, retratos)).toBe(SPRITE_MONOKUMA);
    expect(iconeDoInscrito(null, retratos)).toBeNull();
    expect(iconeDoInscrito('nao-existe', retratos)).toBeNull();
  });
});
