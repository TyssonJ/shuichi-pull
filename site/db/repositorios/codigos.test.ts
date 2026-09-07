import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { urlBancoTeste, clienteTeste, limparTabelas } from '../testes/ambiente';
import { criarRepositorioCodigos } from './codigos';

const rodar = urlBancoTeste() ? describe : describe.skip;

rodar('repositório de códigos (integração)', () => {
  // `describe.skip` ainda executa o corpo da suíte na fase de coleta do
  // Vitest (apenas os `it`s dentro são pulados) — sem este retorno antecipado,
  // `clienteTeste()` lançaria um erro de coleta mesmo com a suíte marcada
  // como skip, quando DATABASE_URL_TEST não está configurada.
  if (!urlBancoTeste()) return;

  const { db, client } = clienteTeste();
  const repo = criarRepositorioCodigos(db);
  const exemplo = {
    codigo: 'TESTE2026', recompensa: '100 moedas', descricao: 'código de teste',
    expiraEm: null, fonte: null,
  };

  beforeEach(async () => { await limparTabelas(db); });
  afterAll(async () => { await client.end(); });

  it('cria e lista', async () => {
    await repo.criar(exemplo);
    expect(await repo.listar()).toHaveLength(1);
  });

  it('exclui', async () => {
    await repo.criar(exemplo);
    await repo.excluir('TESTE2026');
    expect(await repo.listar()).toHaveLength(0);
  });
});
