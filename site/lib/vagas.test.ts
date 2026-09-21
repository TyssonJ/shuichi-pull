import { describe, it, expect } from 'vitest';
import { ocupamVaga, vagasRestantes, podeEntrarComoTitular, validarVagas, contarReservas, VAGAS_MAX } from './vagas';
import { ID_MONOKUMA } from './monokuma';

type I = Parameters<typeof ocupamVaga>[0][number];
const t = (id: string, personagemId: string | null = null): I => ({ discordId: id, personagemId, tipo: 'participante' });
const r = (id: string): I => ({ discordId: id, personagemId: null, tipo: 'reserva' });

describe('vagas', () => {
  it('titular ocupa vaga, inclusive o host de Monokuma; reserva não ocupa', () => {
    const inscritos = [t('a'), t('b', 'makoto-naegi'), r('c'), t('host', ID_MONOKUMA)];
    expect(ocupamVaga(inscritos).map((i) => i.discordId)).toEqual(['a', 'b', 'host']);
    expect(vagasRestantes(inscritos, 16)).toBe(13);
  });

  it('conta as reservas à parte (não são participantes)', () => {
    expect(contarReservas([t('a'), r('b'), r('c'), t('host', ID_MONOKUMA)])).toBe(2);
    expect(contarReservas([t('a')])).toBe(0);
    expect(contarReservas([])).toBe(0);
  });

  it('vagas restantes nunca fica negativa', () => {
    expect(vagasRestantes([t('a'), t('b'), t('c')], 2)).toBe(0);
  });

  it('sala cheia barra novo titular mas não quem já é titular', () => {
    const cheia = [t('a'), t('b')];
    expect(podeEntrarComoTitular(cheia, 2, 'novo')).toBe(false);
    expect(podeEntrarComoTitular(cheia, 2, 'a')).toBe(true);
  });

  it('reserva que vira titular disputa vaga como qualquer outro', () => {
    const inscritos = [t('a'), t('b'), r('c')];
    expect(podeEntrarComoTitular(inscritos, 2, 'c')).toBe(false);
    expect(podeEntrarComoTitular(inscritos, 3, 'c')).toBe(true);
  });

  it('o Monokuma ocupa uma vaga: com a sala cheia de alunos, o host não entra como Monokuma', () => {
    expect(podeEntrarComoTitular([t('a'), t('b')], 2, 'host')).toBe(false);
    // com uma vaga sobrando ele entra, e daí a sala fica cheia
    expect(podeEntrarComoTitular([t('a')], 2, 'host')).toBe(true);
    expect(vagasRestantes([t('a'), t('host', ID_MONOKUMA)], 2)).toBe(0);
  });

  it('o host que já é o Monokuma pode trocar de personagem sem perder a vaga', () => {
    const cheia = [t('a'), t('host', ID_MONOKUMA)];
    expect(podeEntrarComoTitular(cheia, 2, 'host')).toBe(true);
  });

  it('o máximo é 20 vagas de titular', () => {
    expect(VAGAS_MAX).toBe(20);
    expect(() => validarVagas(20)).not.toThrow();
    expect(() => validarVagas(21)).toThrow(/entre 2 e 20/);
    expect(() => validarVagas(40)).toThrow();
  });

  it('valida a faixa de vagas', () => {
    expect(() => validarVagas(16)).not.toThrow();
    expect(() => validarVagas(1)).toThrow(/entre 2 e 20/);
    expect(() => validarVagas(8.5)).toThrow();
  });
});
