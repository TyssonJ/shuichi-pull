import { describe, it, expect } from 'vitest';
import { validarItemExtra, itemParaDados, montarItem, type DadosItemExtra } from './item-extra';

const base: DadosItemExtra = {
  nomePt: 'Espada Flamejante', nomeEn: '',
  categoriaPt: '', categoriaEn: '',
  ramoPt: '', ramoEn: '',
  raridadePt: 'Raro', raridadeEn: 'Rare', nivelRaridade: 3,
  peso: 2.5, icone: null,
  descricaoPt: null, descricaoEn: null,
  efeitoPt: null, efeitoEn: null,
  loja: null, craft: null, spawns: [],
};

describe('item criado pelo ADM', () => {
  it('EN em branco repete o PT, e categoria/ramo caem nos padrões', () => {
    const item = validarItemExtra('espada-flamejante', base);
    expect(item.nome).toEqual({ pt: 'Espada Flamejante', en: 'Espada Flamejante' });
    expect(item.categoria).toEqual({ pt: 'Diversos', en: 'Miscellaneous' });
    expect(item.ramo).toEqual({ pt: 'Diversos', en: 'Miscellaneous' });
    expect(item.descricao).toBeNull();
    expect(item.efeito).toBeNull();
  });

  it('só um idioma preenchido vale pros dois', () => {
    const item = montarItem('x', { ...base, descricaoPt: 'Queima tudo', efeitoEn: 'Burns' });
    expect(item.descricao).toEqual({ pt: 'Queima tudo', en: 'Queima tudo' });
    expect(item.efeito).toEqual({ pt: 'Burns', en: 'Burns' });
  });

  it('loja sem vendedor é descartada', () => {
    expect(montarItem('x', { ...base, loja: { vendedor: '  ', preco: 10 } }).loja).toBeNull();
    expect(montarItem('x', { ...base, loja: { vendedor: 'Monokuma', preco: 10 } }).loja)
      .toEqual({ vendedor: 'Monokuma', preco: 10 });
  });

  it('aceita receita e spawn completos', () => {
    const item = validarItemExtra('espada-flamejante', {
      ...base,
      craft: {
        ingredientes: [{ id: null, nome: { pt: 'Ferro', en: 'Iron' }, qtd: 2, icone: null }],
        bancadas: [{ pt: 'Bancada', en: 'Workbench' }], chance: '100%',
      },
      spawns: [{
        fonteId: 'src_1', local: { pt: 'Ginásio', en: 'Gym' }, localId: 'gym', andar: null,
        conteiner: { pt: 'Baú', en: 'Chest' }, chance: 12.5, qtdMin: 1, qtdMax: 2,
      }],
    });
    expect(item.craft?.ingredientes).toHaveLength(1);
    expect(item.spawns[0].chance).toBe(12.5);
  });

  it('recusa dado inválido com mensagem legível e o campo', () => {
    expect(() => validarItemExtra('x', {
      ...base,
      spawns: [{
        fonteId: 'src_1', local: { pt: 'a', en: 'a' }, localId: 'gym', andar: null,
        conteiner: { pt: 'b', en: 'b' }, chance: 150, qtdMin: 1, qtdMax: 1,
      }],
    })).toThrow(/spawns/);
    expect(() => validarItemExtra('Id Ruim', base)).toThrow(/kebab-case/);
  });

  it('ida e volta pro formulário de edição não perde nada', () => {
    const item = validarItemExtra('espada-flamejante', {
      ...base, nomeEn: 'Flame Sword', descricaoPt: 'Queima', efeitoPt: 'Fogo',
      loja: { vendedor: 'Monokuma', preco: 99 },
    });
    const dados = itemParaDados(item);
    expect(validarItemExtra('espada-flamejante', dados)).toEqual(item);
  });
});
