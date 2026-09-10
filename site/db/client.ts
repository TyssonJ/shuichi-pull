import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

let instancia: DrizzleDb | null = null;

/** Só conecta de verdade no primeiro uso — importar este módulo (direto ou
 * através de um repositório que só precisa da fábrica criarRepositorioX)
 * nunca exige DATABASE_URL sozinho; só usar `db` de fato exige. */
function obterDb(): DrizzleDb {
  if (!instancia) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error('DATABASE_URL não configurada — veja .env.example');
    }
    const client = postgres(url);
    instancia = drizzle({ client, schema });
  }
  return instancia;
}

export const db: DrizzleDb = new Proxy({} as DrizzleDb, {
  get(_target, prop, receiver) {
    return Reflect.get(obterDb() as object, prop, receiver);
  },
});
