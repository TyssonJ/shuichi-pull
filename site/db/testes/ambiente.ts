import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../schema';

/** `null` quando não há banco de teste configurado — os testes que
 * dependem dele se pulam sozinhos em vez de falhar no CI/máquina sem Postgres. */
export function urlBancoTeste(): string | null {
  return process.env.DATABASE_URL_TEST ?? null;
}

export function clienteTeste() {
  const url = urlBancoTeste();
  if (!url) throw new Error('DATABASE_URL_TEST não configurada');
  const client = postgres(url);
  return { db: drizzle({ client, schema }), client };
}

/** Limpa todas as tabelas entre testes, na ordem que respeita FKs
 * implícitas (nenhuma FK real existe hoje, mas a ordem documenta a intenção). */
export async function limparTabelas(db: ReturnType<typeof clienteTeste>['db']) {
  await db.delete(schema.auditoria);
  await db.delete(schema.correcoes);
  await db.delete(schema.codigos);
  await db.delete(schema.eventos);
  await db.delete(schema.administradores);
}
