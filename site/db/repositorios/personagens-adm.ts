import { eq } from 'drizzle-orm';
import type { db as DbClient } from '../client';
import { personagensExtras, personagensRemovidos } from '../schema';
import { SILHUETA } from '../../lib/sprites';
import type { Personagem } from '../../lib/schema';

type Banco = typeof DbClient;
export type NovoPersonagemExtra = typeof personagensExtras.$inferInsert;

function paraPersonagem(linha: typeof personagensExtras.$inferSelect): Personagem {
  return {
    id: linha.id,
    nome: linha.nome,
    talento: { pt: linha.talentoPt, en: linha.talentoEn },
    descricao: { pt: linha.descricaoPt, en: linha.descricaoEn },
    jogo: linha.jogo,
    velocidade: linha.velocidade,
    mochila: linha.mochila,
    percepcao: linha.percepcao,
    vida: linha.vida,
    etiquetas: [],
    sprite: linha.sprite || SILHUETA,
    traducaoRevisada: true,
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
    async criarExtra(dados: NovoPersonagemExtra) {
      await db.insert(personagensExtras).values(dados);
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
