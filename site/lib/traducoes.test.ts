import { describe, it, expect } from 'vitest';
import { traduzirPt } from './traducoes';

describe('traduzirPt', () => {
  it('traduz um talento conhecido', () => {
    expect(traduzirPt('Ultimate Programmer')).toBe('Programação Suprema');
  });

  it('traduz outro talento conhecido', () => {
    expect(traduzirPt('Ultimate Lucky Student')).toBe('Sortudo Supremo');
  });

  it('devolve null para chave sem tradução', () => {
    expect(traduzirPt('Ultimate Nonexistent Thing')).toBeNull();
  });
});
