import { describe, it, expect } from 'vitest';
import { ocupamVaga, vagasRestantes, podeEntrarComoTitular, validarVagas } from './vagas';
import { ID_MONOKUMA } from './monokuma';

type I = Parameters<typeof ocupamVaga>[0][number];
const t = (id: string, personagemId: string | null = null): I => ({ discordId: id, personagemId, tipo: 'participante' });
const r = (id: string): I => ({ discordId: id, personagemId: null, tipo: 'reserva' });

describe('vagas', () => {
  it('reserva e Monokuma não ocupam vaga', () => {
    const inscritos = [t('a'), t('b', 'makoto-naegi'), r('c'), t('host', ID_MONOKUMA)];
    expect(ocupamVaga(inscritos).map((i) => i.discordId)).toEqual(['a', 'b']);
    expect(vagasRestantes(inscritos, 16)).toBe(14);
  });

  it('vagas restantes nunca fica negativa', () => {
    expect(vagasRestantes([t('a'), t('b'), t('c')], 2)).toBe(0);
  });

  it('sala cheia barra novo titular mas não quem já é titular', () => {
    const cheia = [t('a'), t('b')];
    expect(podeEntrarComoTitular(cheia, 2, 'novo', null)).toBe(false);
    expect(podeEntrarComoTitular(cheia, 2, 'a', 'makoto-naegi')).toBe(true);
  });

  it('reserva que vira titular disputa vaga como qualquer outro', () => {
    const inscritos = [t('a'), t('b'), r('c')];
    expect(podeEntrarComoTitular(inscritos, 2, 'c', null)).toBe(false);
    expect(podeEntrarComoTitular(inscritos, 3, 'c', null)).toBe(true);
  });

  it('o host entra de Monokuma mesmo com a sala cheia', () => {
    expect(podeEntrarComoTitular([t('a'), t('b')], 2, 'host', ID_MONOKUMA)).toBe(true);
  });

  it('valida a faixa de vagas', () => {
    expect(() => validarVagas(16)).not.toThrow();
    expect(() => validarVagas(1)).toThrow(/entre 2 e 40/);
    expect(() => validarVagas(41)).toThrow();
    expect(() => validarVagas(8.5)).toThrow();
  });
});
