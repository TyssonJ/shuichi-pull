import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { urlBancoTeste, clienteTeste, limparTabelas } from './ambiente';
import { administradores } from '../schema';

const rodar = urlBancoTeste() ? describe : describe.skip;

rodar('schema do banco (integração)', () => {
  // `describe.skip` ainda executa o corpo da suíte na fase de coleta do
  // Vitest (apenas os `it`s dentro são pulados) — sem este retorno antecipado,
  // `clienteTeste()` lançaria um erro de coleta mesmo com a suíte marcada
  // como skip, quando DATABASE_URL_TEST não está configurada.
  if (!urlBancoTeste()) return;

  const { db, client } = clienteTeste();

  beforeEach(async () => {
    await limparTabelas(db);
  });

  afterAll(async () => {
    await client.end();
  });

  it('grava e lê um administrador de volta', async () => {
    await db.insert(administradores).values({
      discordId: '123456789',
      nome: 'ADM de teste',
      papel: 'chefe',
    });

    const linhas = await db.select().from(administradores);

    expect(linhas).toHaveLength(1);
    expect(linhas[0]).toMatchObject({
      discordId: '123456789',
      nome: 'ADM de teste',
      papel: 'chefe',
      promovidoPor: null,
    });
  });
});
