import { describe, it, expect } from 'vitest';
import { traduzirRuEn, carregarGlossario } from './glossario';

describe('glossário RU→EN', () => {
  it('traduz nome de item conhecido', () => {
    expect(traduzirRuEn('Мелкие детали', 'items')).toBe('Small Parts');
  });

  it('traduz nome de local conhecido', () => {
    expect(traduzirRuEn('1 этаж', 'locations')).toBe('1F');
  });

  it('devolve o termo original quando não há entrada no glossário', () => {
    expect(traduzirRuEn('термин-inexistente', 'items')).toBe('термин-inexistente');
  });

  it('carrega as cinco categorias esperadas', () => {
    const g = carregarGlossario();
    expect(Object.keys(g).sort()).toEqual(
      ['characters', 'items', 'locations', 'statusEffects', 'talents'].sort()
    );
    expect(Object.keys(g.items).length).toBeGreaterThan(150);
  });
});
