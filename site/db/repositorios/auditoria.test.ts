import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { urlBancoTeste, clienteTeste, limparTabelas } from '../testes/ambiente';
import { criarRepositorioAuditoria } from './auditoria';

const rodar = urlBancoTeste() ? describe : describe.skip;

rodar('repositório de auditoria (integração)', () => {
  // `describe.skip` ainda executa o corpo da suíte na fase de coleta do
  // Vitest (apenas os `it`s dentro são pulados) — sem este retorno antecipado,
  // `clienteTeste()` lançaria um erro de coleta mesmo com a suíte marcada
  // como skip, quando DATABASE_URL_TEST não está configurada.
  if (!urlBancoTeste()) return;

  const { db, client } = clienteTeste();
  const repo = criarRepositorioAuditoria(db);

  beforeEach(async () => { await limparTabelas(db); });
  afterAll(async () => { await client.end(); });

  it('registra e lista uma entrada', async () => {
    await repo.registrar({
      autor: '1', acao: 'correcao.criar', alvo: 'itens/x/descricao.pt',
      valorAntigo: null, valorNovo: 'novo valor',
    });

    const linhas = await repo.listarAuditoria();

    expect(linhas).toHaveLength(1);
    expect(linhas[0]).toMatchObject({ autor: '1', acao: 'correcao.criar', valorNovo: 'novo valor' });
  });

  it('filtra por autor', async () => {
    await repo.registrar({ autor: '1', acao: 'a', alvo: 'x', valorAntigo: null, valorNovo: null });
    await repo.registrar({ autor: '2', acao: 'a', alvo: 'x', valorAntigo: null, valorNovo: null });

    const linhas = await repo.listarAuditoria({ autor: '1' });

    expect(linhas).toHaveLength(1);
    expect(linhas[0].autor).toBe('1');
  });

  it('filtra por coleção, buscando no início do alvo', async () => {
    await repo.registrar({ autor: '1', acao: 'a', alvo: 'itens/x/nome', valorAntigo: null, valorNovo: null });
    await repo.registrar({ autor: '1', acao: 'a', alvo: 'personagens/y/nome', valorAntigo: null, valorNovo: null });

    const linhas = await repo.listarAuditoria({ colecao: 'itens' });

    expect(linhas).toHaveLength(1);
    expect(linhas[0].alvo).toBe('itens/x/nome');
  });
});
