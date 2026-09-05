import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { spriteDoPersonagem, SILHUETA } from './sprites';

describe('spriteDoPersonagem', () => {
  it('devolve a arte de quem tem sprite extraído', () => {
    expect(spriteDoPersonagem('chihiro-fujisaki')).toMatch(/^\/sprites\/chihiro\/.+\.webp$/);
    expect(spriteDoPersonagem('shuichi-saihara')).toMatch(/^\/sprites\/shuichi\/.+\.webp$/);
  });

  it('dá a arte da Junko só para a Junko de verdade, não para a Mukuro disfarçada', () => {
    expect(spriteDoPersonagem('junko-enoshima-ultimate-analyst')).toMatch(/^\/sprites\/junko\//);
    expect(spriteDoPersonagem('junko-enoshima-ultimate-fashionista')).toBe(SILHUETA);
  });

  it('cai na silhueta para quem ainda não tem arte', () => {
    expect(spriteDoPersonagem('makoto-naegi')).toBe(SILHUETA);
  });

  it('todo caminho devolvido existe em public/', () => {
    const ids = ['chihiro-fujisaki', 'shuichi-saihara', 'junko-enoshima-ultimate-analyst', 'makoto-naegi'];
    for (const id of ids) {
      const arquivo = path.join(process.cwd(), 'public', spriteDoPersonagem(id));
      expect(fs.existsSync(arquivo), `faltou ${arquivo}`).toBe(true);
    }
  });
});
