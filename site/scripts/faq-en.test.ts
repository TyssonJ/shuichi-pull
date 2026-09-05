import { describe, it, expect } from 'vitest';
import { extrairFaq, carregarFaqEn } from './faq-en';

const trecho = `# 13 - FAQ (secao 12)

# Getting started

## How do I start playing?

- Buy Garry's Mod on Steam.

- Launch the game.

## What age can you play from?

No age restrictions.

# Game mechanics

## How do I use the monopad?

Open the inventory.
`;

describe('extrairFaq', () => {
  it('separa seção, pergunta e resposta', () => {
    const f = extrairFaq(trecho);
    expect(f).toHaveLength(3);
    expect(f[0]).toMatchObject({
      secao: 'Getting started', pergunta: 'How do I start playing?',
    });
    expect(f[0].resposta).toContain('Garry');
  });

  it('ignora o título do arquivo como seção', () => {
    expect(extrairFaq(trecho).every((p) => !p.secao.startsWith('13'))).toBe(true);
  });

  it('troca de seção no meio do arquivo', () => {
    expect(extrairFaq(trecho)[2].secao).toBe('Game mechanics');
  });

  it('descarta pergunta sem resposta', () => {
    expect(extrairFaq('# A\n\n## Sem resposta\n')).toEqual([]);
  });
});

describe('carregarFaqEn', () => {
  it('lê as 51 perguntas do guidebook', () => {
    expect(carregarFaqEn()).toHaveLength(51);
  });

  it('traz as sete seções', () => {
    const secoes = new Set(carregarFaqEn().map((p) => p.secao));
    expect(secoes.size).toBe(7);
  });
});
