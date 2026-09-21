import { describe, it, expect } from 'vitest';
import { gerarChave, hashDaChave, chaveConfere, extrairBearer, PREFIXO_CHAVE } from './chave';

describe('chave do Junko', () => {
  it('gera chaves longas, com prefixo e diferentes a cada vez', () => {
    const a = gerarChave();
    const b = gerarChave();
    expect(a.startsWith(PREFIXO_CHAVE)).toBe(true);
    expect(a.length).toBeGreaterThan(40);
    expect(a).not.toBe(b);
  });

  it('o hash não contém a chave e é estável', () => {
    const chave = gerarChave();
    expect(hashDaChave(chave)).toBe(hashDaChave(chave));
    expect(hashDaChave(chave)).toMatch(/^[0-9a-f]{64}$/);
    expect(hashDaChave(chave)).not.toContain(chave);
  });

  it('confere a chave certa e rejeita a errada', () => {
    const chave = gerarChave();
    const hash = hashDaChave(chave);
    expect(chaveConfere(chave, hash)).toBe(true);
    expect(chaveConfere(chave + 'x', hash)).toBe(false);
    expect(chaveConfere(gerarChave(), hash)).toBe(false);
  });

  it('sem hash guardado nada passa (integração não configurada)', () => {
    expect(chaveConfere('qualquer', null)).toBe(false);
    expect(chaveConfere('qualquer', undefined)).toBe(false);
    expect(chaveConfere('qualquer', '')).toBe(false);
  });

  it('hash guardado corrompido não passa nem quebra', () => {
    expect(chaveConfere('qualquer', 'nao-e-hex')).toBe(false);
  });

  it('extrai só o formato Bearer <chave>', () => {
    expect(extrairBearer('Bearer abc123')).toBe('abc123');
    expect(extrairBearer('bearer abc123')).toBe('abc123');
    expect(extrairBearer('Basic abc123')).toBeNull();
    expect(extrairBearer('Bearer')).toBeNull();
    expect(extrairBearer('Bearer a b')).toBeNull();
    expect(extrairBearer(null)).toBeNull();
  });
});
