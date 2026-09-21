import { describe, it, expect } from 'vitest';
import { mesclarSpawnsNosLocais } from './spawns-extras';
import type { Item, Local } from './schema-itens';

const T = (s: string) => ({ pt: s, en: s });

function local(): Local {
  return {
    id: 'gym', nome: T('Ginásio'), andar: null, totalItens: 1, traducaoRevisada: true,
    conteineres: [
      { fonteId: 'a', nome: T('Baú A'), itens: [{ id: 'corda', nome: T('Corda'), chance: 10, qtdMin: 1, qtdMax: 1 }] },
      { fonteId: 'b', nome: T('Baú B'), itens: [] },
    ],
  };
}

function item(id: string, spawns: Item['spawns']): Item {
  return {
    id, nome: T(id), categoria: T('x'), ramo: T('x'), raridade: T('x'), nivelRaridade: 1,
    peso: null, icone: null, descricao: null, efeito: null, mecanicas: {}, loja: null,
    craft: null, spawns, traducaoRevisada: true,
  };
}

const spawn = (fonteId: string, localId = 'gym'): Item['spawns'][number] => ({
  fonteId, local: T('Ginásio'), localId, andar: null, conteiner: T('Baú'),
  chance: 25, qtdMin: 1, qtdMax: 3,
});

describe('mesclarSpawnsNosLocais', () => {
  it('sem item com spawn devolve a mesma lista', () => {
    const locais = [local()];
    expect(mesclarSpawnsNosLocais(locais, [item('x', [])])).toBe(locais);
  });

  it('põe o item no contêiner certo e conta um item único a mais', () => {
    const [resultado] = mesclarSpawnsNosLocais([local()], [item('espada', [spawn('b')])]);
    expect(resultado.conteineres[1].itens).toEqual([
      { id: 'espada', nome: T('espada'), chance: 25, qtdMin: 1, qtdMax: 3 },
    ]);
    expect(resultado.totalItens).toBe(2);
  });

  it('o mesmo item em dois contêineres do local conta uma vez só', () => {
    const [resultado] = mesclarSpawnsNosLocais([local()], [item('espada', [spawn('a'), spawn('b')])]);
    expect(resultado.conteineres[0].itens.map((i) => i.id)).toEqual(['corda', 'espada']);
    expect(resultado.conteineres[1].itens.map((i) => i.id)).toEqual(['espada']);
    expect(resultado.totalItens).toBe(2);
  });

  it('ignora local ou contêiner que não existem, e não duplica', () => {
    const original = local();
    const [resultado] = mesclarSpawnsNosLocais(
      [original],
      [item('espada', [spawn('nao-existe'), spawn('a', 'outro-local')]), item('corda', [spawn('a')])],
    );
    expect(resultado.conteineres[0].itens).toHaveLength(1);
    expect(resultado.totalItens).toBe(1);
  });

  it('não muta os locais de entrada', () => {
    const original = local();
    mesclarSpawnsNosLocais([original], [item('espada', [spawn('b')])]);
    expect(original.conteineres[1].itens).toHaveLength(0);
    expect(original.totalItens).toBe(1);
  });
});
