import { describe, it, expect } from 'vitest';
import { paraNumero } from './campos-form';
import { SILHUETA } from '@/lib/sprites';
import { SILHUETA_PADRAO } from '@/lib/adm/personagem-extra';

describe('paraNumero', () => {
  it('aceita vírgula e ponto como decimal', () => {
    expect(paraNumero('12,5')).toBe(12.5);
    expect(paraNumero('12.5')).toBe(12.5);
    expect(paraNumero(' 7 ')).toBe(7);
  });

  it('vazio ou lixo vira null, não zero', () => {
    expect(paraNumero('')).toBeNull();
    expect(paraNumero('   ')).toBeNull();
    expect(paraNumero('abc')).toBeNull();
  });
});

describe('silhueta padrão', () => {
  it('a cópia usada no formulário de personagem bate com a de lib/sprites', () => {
    // lib/sprites usa fs e não pode ir pro bundle do cliente — daí a cópia.
    expect(SILHUETA_PADRAO).toBe(SILHUETA);
  });
});
