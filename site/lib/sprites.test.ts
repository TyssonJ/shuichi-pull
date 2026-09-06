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

describe('qualidade do conjunto de sprites', () => {
  const fontes = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), '..', 'assets', 'sprites', 'elenco', '_fontes.json'),
      'utf-8'
    )
  ) as Record<string, string>;

  it('registra a origem de todos os 56 sprites', () => {
    expect(Object.keys(fontes)).toHaveLength(56);
  });

  it('nenhum sprite é de corpo inteiro', () => {
    const inteiros = Object.entries(fontes).filter(([, t]) => /fullbody/i.test(t));
    expect(inteiros.map(([id]) => id)).toEqual([]);
  });

  it('o arquivo de cada personagem traz o nome dele, não o de um cosplay', () => {
    const errados = listarPersonagens().filter((p) => {
      const titulo = fontes[p.id];
      if (!titulo) return true;
      // O titulo tem que comecar pelo personagem: "Tsumugi ... (Nekomaru Nidai)"
      // menciona o Nekomaru, mas a sprite e da Tsumugi.
      const antesDoParenteses = titulo.split('(')[0].toLowerCase();
      return !antesDoParenteses.includes(p.nome.toLowerCase());
    });
    expect(errados.map((p) => p.id)).toEqual([]);
  });

  it('nenhum sprite é desproporcionalmente alto para a grade da listagem', async () => {
    const sharp = (await import('sharp')).default;
    const dir = path.join(process.cwd(), 'public', 'sprites', 'elenco');
    const altos: string[] = [];

    for (const arquivo of fs.readdirSync(dir)) {
      const { width, height } = await sharp(path.join(dir, arquivo)).metadata();
      if (height! / width! > 2.2) altos.push(`${arquivo} (${width}x${height})`);
    }

    expect(altos).toEqual([]);
  }, 60_000);
});
