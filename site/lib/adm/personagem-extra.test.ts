import { describe, it, expect } from 'vitest';
import {
  validarPersonagemExtra, personagemParaDados, montarPersonagem, SILHUETA_PADRAO,
  type DadosPersonagemExtra,
} from './personagem-extra';

const base: DadosPersonagemExtra = {
  nome: 'Akira Nova', jogo: 'Shinri Trial',
  talentoPt: '', talentoEn: '', descricaoPt: '', descricaoEn: '',
  velocidade: 190, mochila: 15, percepcao: 5, vida: 100,
  sprite: null, etiquetas: [],
  personalidade: null, aparencia: null, historia: null, segredo: null,
};

describe('personagem criado pelo ADM', () => {
  it('sem sprite usa a silhueta e completa talento/descrição', () => {
    const p = validarPersonagemExtra('akira-nova', base);
    expect(p.sprite).toBe(SILHUETA_PADRAO);
    expect(p.talento.pt).toBe('Sem talento definido');
    expect(p.talento.en).toBe('Sem talento definido');
    expect(p.traducaoRevisada).toBe(true);
  });

  it('campos do perfil expandido em branco viram ausentes, não string vazia', () => {
    const p = montarPersonagem('akira-nova', { ...base, personalidade: '   ', historia: 'Nasceu longe.' });
    expect(p.personalidade).toBeUndefined();
    expect(p.historia).toBe('Nasceu longe.');
    expect(p.segredo).toBeUndefined();
  });

  it('etiquetas: ignora linha vazia e repete PT no EN quando falta', () => {
    const p = montarPersonagem('x', {
      ...base,
      etiquetas: [{ pt: 'Ágil', en: '', bom: true }, { pt: '', en: 'x', bom: false }],
    });
    expect(p.etiquetas).toEqual([{ pt: 'Ágil', en: 'Ágil', bom: true }]);
  });

  it('recusa atributo fora da faixa do jogo, dizendo qual', () => {
    expect(() => validarPersonagemExtra('x', { ...base, velocidade: 50 })).toThrow(/velocidade/);
    expect(() => validarPersonagemExtra('x', { ...base, percepcao: 11 })).toThrow(/percepcao/);
  });

  it('ida e volta pro formulário de edição não perde nada', () => {
    const p = validarPersonagemExtra('akira-nova', {
      ...base, sprite: 'https://exemplo.com/a.png', personalidade: 'Calma',
      etiquetas: [{ pt: 'Sortudo', en: 'Lucky', bom: true }],
    });
    expect(validarPersonagemExtra('akira-nova', personagemParaDados(p))).toEqual(p);
  });
});
