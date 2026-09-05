import { describe, it, expect } from 'vitest';
import { validarItens, validarLocais } from './schema-itens';

const item = {
  id: 'small-parts',
  nome: { pt: 'Peças Miúdas', en: 'Small Parts' },
  categoria: { pt: 'Recurso', en: 'Resource' },
  ramo: { pt: 'Engenharia', en: 'Engineering' },
  raridade: { pt: 'Incomum', en: 'Uncommon' },
  nivelRaridade: 2,
  peso: 0.2,
  descricao: { pt: 'Peças pequenas.', en: 'Small parts.' },
  efeito: null,
  mecanicas: {},
  loja: null,
  craft: {
    ingredientes: [{ id: 'rusty-scrap-metal', nome: { pt: 'Sucata', en: 'Scrap' }, qtd: 3 }],
    bancadas: [{ pt: 'Bancada', en: 'Workbench' }],
    chance: '100%',
  },
  spawns: [{
    fonteId: 'src_000', local: { pt: 'Ginásio', en: 'Gym' }, localId: 'ginasio',
    andar: { pt: '1º andar', en: '1F' }, conteiner: { pt: 'Armários', en: 'Lockers' },
    chance: 50, qtdMin: 1, qtdMax: 2,
  }],
  traducaoRevisada: false,
};

describe('validarItens', () => {
  it('aceita um item completo', () => {
    const r = validarItens([item]);
    expect(r[0].id).toBe('small-parts');
    expect(r[0].spawns[0].chance).toBe(50);
  });

  it('aceita item sem craft, sem loja e sem peso', () => {
    const r = validarItens([{ ...item, craft: null, loja: null, peso: null, descricao: null }]);
    expect(r[0].craft).toBeNull();
  });

  it('rejeita id fora do kebab-case', () => {
    expect(() => validarItens([{ ...item, id: 'Small Parts' }])).toThrow();
  });

  it('rejeita chance de spawn acima de 100', () => {
    const quebrado = { ...item, spawns: [{ ...item.spawns[0], chance: 140 }] };
    expect(() => validarItens([quebrado])).toThrow();
  });

  it('rejeita craft sem nenhum ingrediente', () => {
    const quebrado = { ...item, craft: { ...item.craft, ingredientes: [] } };
    expect(() => validarItens([quebrado])).toThrow();
  });
});

describe('validarLocais', () => {
  const local = {
    id: 'ginasio',
    nome: { pt: 'Ginásio', en: 'Gym' },
    andar: { pt: '1º andar', en: '1F' },
    conteineres: [{
      fonteId: 'src_000',
      nome: { pt: 'Armários', en: 'Lockers' },
      itens: [{ id: 'rag', nome: { pt: 'Pano', en: 'Rag' }, chance: 50, qtdMin: 1, qtdMax: 1 }],
    }],
    totalItens: 1,
    traducaoRevisada: false,
  };

  it('aceita um local completo', () => {
    expect(validarLocais([local])[0].conteineres[0].itens).toHaveLength(1);
  });

  it('aceita local sem andar e sem contêiner', () => {
    const r = validarLocais([{ ...local, andar: null, conteineres: [], totalItens: 0 }]);
    expect(r[0].conteineres).toEqual([]);
  });
});
