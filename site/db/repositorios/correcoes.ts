import { eq, and } from 'drizzle-orm';
import type { db as DbClient } from '../client';
import { correcoes } from '../schema';
import { criarRepositorioAuditoria } from './auditoria';
import type { Colecao, MapaCorrecoes } from '../../lib/correcoes-merge';

type Banco = typeof DbClient;

export function criarRepositorioCorrecoes(db: Banco) {
  const auditoria = criarRepositorioAuditoria(db);

  return {
    async buscarCorrecoesPorColecao(colecao: Colecao): Promise<MapaCorrecoes> {
      const linhas = await db.select().from(correcoes).where(eq(correcoes.colecao, colecao));

      const mapa: MapaCorrecoes = new Map();
      for (const linha of linhas) {
        if (!mapa.has(linha.registroId)) mapa.set(linha.registroId, new Map());
        mapa.get(linha.registroId)!.set(linha.campo, {
          valor: linha.valor,
          valorBase: linha.valorBase,
          autor: linha.autor,
          criadoEm: linha.criadoEm.toISOString(),
        });
      }
      return mapa;
    },

    async salvarCorrecao(args: {
      colecao: Colecao; registroId: string; campo: string;
      valor: string; valorBase: string; autor: string;
    }) {
      const alvo = and(
        eq(correcoes.colecao, args.colecao),
        eq(correcoes.registroId, args.registroId),
        eq(correcoes.campo, args.campo),
      );
      const anterior = await db.select().from(correcoes).where(alvo);

      await db.insert(correcoes).values(args).onConflictDoUpdate({
        target: [correcoes.colecao, correcoes.registroId, correcoes.campo],
        set: { valor: args.valor, valorBase: args.valorBase, autor: args.autor, criadoEm: new Date() },
      });

      await auditoria.registrar({
        autor: args.autor,
        acao: 'correcao.criar',
        alvo: `${args.colecao}/${args.registroId}/${args.campo}`,
        valorAntigo: anterior[0]?.valor ?? null,
        valorNovo: args.valor,
      });
    },

    async reverterCorrecao(args: { colecao: Colecao; registroId: string; campo: string; autor: string }) {
      const alvo = and(
        eq(correcoes.colecao, args.colecao),
        eq(correcoes.registroId, args.registroId),
        eq(correcoes.campo, args.campo),
      );
      const existente = await db.select().from(correcoes).where(alvo);
      if (existente.length === 0) return;

      await db.delete(correcoes).where(alvo);

      await auditoria.registrar({
        autor: args.autor,
        acao: 'correcao.reverter',
        alvo: `${args.colecao}/${args.registroId}/${args.campo}`,
        valorAntigo: existente[0].valor,
        valorNovo: null,
      });
    },
  };
}

// Instância padrão para uso em produção — importa o client real.
import { db } from '../client';
export const repositorioCorrecoes = criarRepositorioCorrecoes(db);
