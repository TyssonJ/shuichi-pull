import { ZodError } from 'zod';
import { PersonagemSchema, type Personagem, type Etiqueta } from '../schema';

export const SILHUETA_PADRAO = '/sprites/silhueta.svg';

/** O que o formulário completo de personagem manda pro servidor. */
export type DadosPersonagemExtra = {
  nome: string; jogo: string;
  talentoPt: string; talentoEn: string;
  descricaoPt: string; descricaoEn: string;
  velocidade: number; mochila: number; percepcao: number; vida: number;
  sprite: string | null;
  etiquetas: Etiqueta[];
  personalidade: string | null; aparencia: string | null;
  historia: string | null; segredo: string | null;
};

const vazio = (s: string | null | undefined) => !s || !s.trim();
const opcional = (s: string | null) => (vazio(s) ? undefined : s!.trim());

export function montarPersonagem(id: string, d: DadosPersonagemExtra): Personagem {
  const talentoPt = vazio(d.talentoPt) ? 'Sem talento definido' : d.talentoPt.trim();
  const descricaoPt = vazio(d.descricaoPt) ? 'Sem descrição ainda.' : d.descricaoPt.trim();
  return {
    id,
    nome: d.nome.trim(),
    talento: { pt: talentoPt, en: vazio(d.talentoEn) ? talentoPt : d.talentoEn.trim() },
    descricao: { pt: descricaoPt, en: vazio(d.descricaoEn) ? descricaoPt : d.descricaoEn.trim() },
    jogo: d.jogo.trim(),
    velocidade: d.velocidade,
    mochila: d.mochila,
    percepcao: d.percepcao,
    vida: d.vida,
    etiquetas: d.etiquetas
      .filter((e) => !vazio(e.pt))
      .map((e) => ({ pt: e.pt.trim(), en: vazio(e.en) ? e.pt.trim() : e.en.trim(), bom: e.bom })),
    sprite: vazio(d.sprite) ? SILHUETA_PADRAO : d.sprite!.trim(),
    traducaoRevisada: true,
    personalidade: opcional(d.personalidade),
    aparencia: opcional(d.aparencia),
    historia: opcional(d.historia),
    segredo: opcional(d.segredo),
  };
}

export function validarPersonagemExtra(id: string, d: DadosPersonagemExtra): Personagem {
  try {
    return PersonagemSchema.parse(montarPersonagem(id, d));
  } catch (e) {
    if (e instanceof ZodError) {
      const i = e.issues[0];
      throw new Error(`Personagem inválido em "${i.path.join('.') || 'personagem'}": ${i.message}`);
    }
    throw e;
  }
}

export function personagemParaDados(p: Personagem): DadosPersonagemExtra {
  return {
    nome: p.nome, jogo: p.jogo,
    talentoPt: p.talento.pt, talentoEn: p.talento.en,
    descricaoPt: p.descricao.pt, descricaoEn: p.descricao.en,
    velocidade: p.velocidade, mochila: p.mochila, percepcao: p.percepcao, vida: p.vida,
    sprite: p.sprite === SILHUETA_PADRAO ? null : p.sprite,
    etiquetas: p.etiquetas,
    personalidade: p.personalidade ?? null, aparencia: p.aparencia ?? null,
    historia: p.historia ?? null, segredo: p.segredo ?? null,
  };
}
