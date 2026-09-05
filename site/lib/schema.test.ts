import { describe, it, expect } from 'vitest';
import { validarPersonagens } from './schema';

const valido = {
  id: 'chihiro-fujisaki',
  nome: 'Chihiro Fujisaki',
  talento: { pt: 'Programação Suprema', en: 'Ultimate Programmer' },
  descricao: { pt: 'Uma pessoa frágil e tímida.', en: 'A fragile and shy youth.' },
  jogo: 'Danganronpa: Trigger Happy Havoc',
  velocidade: 180,
  mochila: 13,
  percepcao: 9,
  vida: 100,
  etiquetas: [{ pt: 'Fome 20% menos frequente', en: 'Hunger 20% less often', bom: true }],
  sprite: '/sprites/chihiro/halfbody-01.webp',
  traducaoRevisada: false,
};

describe('validarPersonagens', () => {
  it('aceita um personagem completo', () => {
    const r = validarPersonagens([valido]);
    expect(r).toHaveLength(1);
    expect(r[0].id).toBe('chihiro-fujisaki');
    expect(r[0].percepcao).toBe(9);
  });

  it('rejeita quando falta um atributo obrigatório', () => {
    const { velocidade, ...semVelocidade } = valido;
    expect(() => validarPersonagens([semVelocidade])).toThrow();
  });

  it('rejeita percepção fora da faixa de 1 a 10', () => {
    expect(() => validarPersonagens([{ ...valido, percepcao: 11 }])).toThrow();
  });

  it('rejeita id que não seja kebab-case', () => {
    expect(() => validarPersonagens([{ ...valido, id: 'Chihiro Fujisaki' }])).toThrow();
  });
});
