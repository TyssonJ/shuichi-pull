import { describe, it, expect } from 'vitest';
import { validarCargo, corDoTextoSobre, CARGO_NOME_MAX } from './cargos';

describe('validarCargo', () => {
  it('normaliza nome e cor', () => {
    expect(validarCargo({ nome: '  Veterano   Sênior ', cor: ' #00FF66 ' })).toEqual({
      ok: true, valor: { nome: 'Veterano Sênior', cor: '#00ff66' },
    });
  });

  it('nome: mínimo, máximo (contando caracteres) e invisíveis', () => {
    expect(validarCargo({ nome: 'a', cor: '#000000' }).ok).toBe(false);
    expect(validarCargo({ nome: 'a'.repeat(CARGO_NOME_MAX), cor: '#000000' }).ok).toBe(true);
    expect(validarCargo({ nome: 'a'.repeat(CARGO_NOME_MAX + 1), cor: '#000000' }).ok).toBe(false);
    expect(validarCargo({ nome: 'ab' + String.fromCharCode(0x200b) + 'cd', cor: '#000000' }).ok).toBe(false);
  });

  it.each(['00ff66', '#0f6', '#gggggg', 'verde', '#00ff66ff', ''])('recusa a cor %j', (cor) => {
    const r = validarCargo({ nome: 'Calouro', cor });
    expect(r.ok).toBe(false);
    expect(!r.ok && r.erro).toContain('#RRGGBB');
  });
});

describe('corDoTextoSobre', () => {
  it('texto escuro em fundo claro e claro em fundo escuro', () => {
    expect(corDoTextoSobre('#ffffff')).toBe('#08090D');
    expect(corDoTextoSobre('#f5d30e')).toBe('#08090D');
    expect(corDoTextoSobre('#00ff66')).toBe('#08090D');
    expect(corDoTextoSobre('#000000')).toBe('#F2F2F5');
    expect(corDoTextoSobre('#7a1fa2')).toBe('#F2F2F5');
    expect(corDoTextoSobre('#ff007f')).toBe('#F2F2F5');
  });
});
