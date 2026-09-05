import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { spriteDoPersonagem, SILHUETA } from './sprites';
import { listarPersonagens } from './dados';

describe('spriteDoPersonagem', () => {
  it('devolve a arte de quem tem sprite baixado', () => {
    expect(spriteDoPersonagem('chihiro-fujisaki')).toBe('/sprites/elenco/chihiro-fujisaki.webp');
    expect(spriteDoPersonagem('makoto-naegi')).toBe('/sprites/elenco/makoto-naegi.webp');
  });

  it('cai na silhueta para quem não tem arquivo', () => {
    expect(spriteDoPersonagem('personagem-que-nao-existe')).toBe(SILHUETA);
  });

  it('todo personagem do elenco aponta para um arquivo que existe', () => {
    for (const p of listarPersonagens()) {
      const arquivo = path.join(process.cwd(), 'public', p.sprite);
      expect(fs.existsSync(arquivo), `faltou ${p.sprite} (${p.id})`).toBe(true);
    }
  });

  it('ninguém ficou na silhueta depois do download', () => {
    const semArte = listarPersonagens().filter((p) => p.sprite === SILHUETA);
    expect(semArte.map((p) => p.id)).toEqual([]);
  });
});
