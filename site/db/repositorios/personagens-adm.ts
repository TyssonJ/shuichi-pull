import { eq } from 'drizzle-orm';
import { z } from 'zod';
import type { db as DbClient } from '../client';
import { personagensExtras, personagensRemovidos } from '../schema';
import { EtiquetaSchema, type Personagem } from '../../lib/schema';
import {
  montarPersonagem, SILHUETA_PADRAO, type DadosPersonagemExtra,
} from '../../lib/adm/personagem-extra';

type Banco = typeof DbClient;
type Linha = typeof personagensExtras.$inferSelect;

function paraPersonagem(l: Linha): Personagem {
  const etiquetas = z.array(EtiquetaSchema).safeParse(l.etiquetas ?? []);
  const dados: DadosPersonagemExtra = {
    nome: l.nome, jogo: l.jogo,
    talentoPt: l.talentoPt, talentoEn: l.talentoEn,
    descricaoPt: l.descricaoPt, descricaoEn: l.descricaoEn,
    velocidade: l.velocidade, mochila: l.mochila, percepcao: l.percepcao, vida: l.vida,
    sprite: l.sprite,
    etiquetas: etiquetas.success ? etiquetas.data : [],
    personalidade: l.personalidade, aparencia: l.aparencia,
    historia: l.historia, segredo: l.segredo,
  };
  return montarPersonagem(l.id, dados);
}

function paraLinha(p: Personagem) {
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

export function criarRepositorioPersonagensAdm(db: Banco) {
  return {
    async listarExtras(): Promise<Personagem[]> {
      const linhas = await db.select().from(personagensExtras);
      return linhas.map(paraPersonagem);
    },
    async listarRemovidos(): Promise<Set<string>> {
      const linhas = await db.select().from(personagensRemovidos);
      return new Set(linhas.map((l) => l.personagemId));
    },
    async criarExtra(p: Personagem, autor: string) {
      await db.insert(personagensExtras).values({ id: p.id, autor, ...paraLinha(p) });
    },
    async atualizarExtra(p: Personagem) {
      await db.update(personagensExtras).set(paraLinha(p)).where(eq(personagensExtras.id, p.id));
    },
    /** Some com o personagem — se for um extra criado pelo ADM, apaga de
     * vez; se for do guidebook, só marca como removido (o dado-fonte
     * continua intacto em data/personagens.json). */
    async excluir(id: string, autor: string) {
      const extra = await db.select().from(personagensExtras).where(eq(personagensExtras.id, id));
      if (extra.length > 0) {
        await db.delete(personagensExtras).where(eq(personagensExtras.id, id));
        return;
      }
      await db.insert(personagensRemovidos).values({ personagemId: id, autor }).onConflictDoNothing();
    },
    async restaurar(id: string) {
      await db.delete(personagensRemovidos).where(eq(personagensRemovidos.personagemId, id));
    },
  };
}

// Instância padrão para uso em produção — importa o client real.
import { db } from '../client';
export const repositorioPersonagensAdm = criarRepositorioPersonagensAdm(db);
