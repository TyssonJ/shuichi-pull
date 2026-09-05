import { describe, it, expect } from 'vitest';
import { extrairFontes, carregarFontesEn } from './fontes-en';

const trecho = `# 06 - Drop rates

## Lockers (×3) by the workbench in the gym (1F)  \`src_000\`
- tipo: random | andar: 1F | local: Gym | container: Lockers (×3) by the workbench
    - Rag \`rag\` - 50% | qtd 1-1 | Non-stackable

## Bin by the vending machine in the lobby  \`src_010\`
- tipo: random | andar: 1F | local: Lobby | container: Bin by the vending machine
`;

describe('extrairFontes', () => {
  it('lê o contêiner, o local e o andar em inglês por sourceId', () => {
    const f = extrairFontes(trecho);
    expect(f.get('src_000')).toEqual({
      conteiner: 'Lockers (×3) by the workbench', local: 'Gym', andar: '1F',
    });
    expect(f.get('src_010')?.local).toBe('Lobby');
  });

  it('devolve vazio para markdown sem fonte', () => {
    expect(extrairFontes('# nada aqui').size).toBe(0);
  });
});

describe('carregarFontesEn', () => {
  it('lê as 179 fontes do guidebook', () => {
    expect(carregarFontesEn().size).toBe(179);
  });

  it('nenhum nome de contêiner vem em russo', () => {
    const russo = [...carregarFontesEn().values()]
      .filter((f) => /[\u0400-\u04FF]/.test(f.conteiner));
    expect(russo).toEqual([]);
  });
});
