import { describe, it, expect } from 'vitest';
import { resumirItem } from './itens-resumo';
import { buscarItem, listarItens } from './itens';

describe('resumirItem', () => {
  it('leva só o que o cartão desenha', () => {
    const r = resumirItem(buscarItem('small-parts')!);
    expect(Object.keys(r).sort()).toEqual(
      ['categoria', 'fabricavel', 'icone', 'id', 'local', 'nivelRaridade', 'nome', 'peso', 'raridade'],
    );
    expect(r).toMatchObject({ id: 'small-parts', fabricavel: true, nome: { pt: 'Peças Miúdas', en: 'Small Parts' } });
  });

  it('fabricável e local vêm da receita e do primeiro spawn', () => {
    const itens = listarItens();
    const comReceita = itens.find((i) => i.craft !== null)!;
    const semReceita = itens.find((i) => i.craft === null)!;
    expect(resumirItem(comReceita).fabricavel).toBe(true);
    expect(resumirItem(semReceita).fabricavel).toBe(false);
    const comSpawn = itens.find((i) => i.spawns.length > 0)!;
    expect(resumirItem(comSpawn).local).toBe(comSpawn.spawns[0].local.pt);
  });

  it('o catálogo inteiro cabe em uma fração do tamanho original (era ~450 KB indo pro navegador)', () => {
    const itens = listarItens();
    const cheio = JSON.stringify(itens).length;
    const enxuto = JSON.stringify(itens.map(resumirItem)).length;
    expect(enxuto).toBeLessThan(cheio * 0.3);
  });
});
