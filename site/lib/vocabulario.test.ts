import { describe, it, expect } from 'vitest';
import { traduzirVocabulario, nivelDaRaridade, RARIDADES } from './vocabulario';

describe('traduzirVocabulario', () => {
  it('traduz categoria do russo para PT e EN', () => {
    expect(traduzirVocabulario('Ресурс')).toEqual({ pt: 'Recurso', en: 'Resource' });
    expect(traduzirVocabulario('Оружие/Инструмento' as never)).toBeNull();
  });

  it('traduz raridade e ramo', () => {
    expect(traduzirVocabulario('Легендарный')).toEqual({ pt: 'Lendário', en: 'Legendary' });
    expect(traduzirVocabulario('Медицина')).toEqual({ pt: 'Medicina', en: 'Medicine' });
  });

  it('devolve null para termo desconhecido', () => {
    expect(traduzirVocabulario('термо-desconhecido')).toBeNull();
  });
});

describe('nivelDaRaridade', () => {
  it('ordena da mais comum para a mais rara', () => {
    expect(nivelDaRaridade('Обычный')).toBe(1);
    expect(nivelDaRaridade('Необычный')).toBe(2);
    expect(nivelDaRaridade('Редкий')).toBe(3);
    expect(nivelDaRaridade('Очень редкий')).toBe(4);
    expect(nivelDaRaridade('Легендарный')).toBe(5);
  });

  it('lista as cinco raridades na ordem', () => {
    expect(RARIDADES.map((r) => r.pt)).toEqual([
      'Comum', 'Incomum', 'Raro', 'Muito raro', 'Lendário',
    ]);
  });
});
