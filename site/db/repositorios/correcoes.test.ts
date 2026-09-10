import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { urlBancoTeste, clienteTeste, limparTabelas } from '../testes/ambiente';
import { criarRepositorioCorrecoes } from './correcoes';
import { criarRepositorioAuditoria } from './auditoria';

const rodar = urlBancoTeste() ? describe : describe.skip;

rodar('repositório de correções (integração)', () => {
  // `describe.skip` ainda executa o corpo da suíte na fase de coleta do
  // Vitest (apenas os `it`s dentro são pulados) — sem este retorno antecipado,
  // `clienteTeste()` lançaria um erro de coleta mesmo com a suíte marcada
  // como skip, quando DATABASE_URL_TEST não está configurada.
  if (!urlBancoTeste()) return;

  const { db, client } = clienteTeste();
  const repo = criarRepositorioCorrecoes(db);
  const auditoria = criarRepositorioAuditoria(db);

  beforeEach(async () => { await limparTabelas(db); });
  afterAll(async () => { await client.end(); });

  it('busca vazio para coleção sem correções', async () => {
    const mapa = await repo.buscarCorrecoesPorColecao('itens');
    expect(mapa.size).toBe(0);
  });

  it('salva e busca de volta', async () => {
    await repo.salvarCorrecao({
      colecao: 'itens', registroId: 'chave-mestra', campo: 'nome.pt',
      valor: 'Chave-Mestra', valorBase: 'Chave Mestra', autor: '1',
    });

    const mapa = await repo.buscarCorrecoesPorColecao('itens');

    expect(mapa.get('chave-mestra')?.get('nome.pt')?.valor).toBe('Chave-Mestra');
  });

  it('salvar de novo no mesmo alvo substitui, não duplica', async () => {
    await repo.salvarCorrecao({ colecao: 'itens', registroId: 'x', campo: 'nome.pt', valor: 'A', valorBase: 'base', autor: '1' });
    await repo.salvarCorrecao({ colecao: 'itens', registroId: 'x', campo: 'nome.pt', valor: 'B', valorBase: 'base', autor: '1' });

    const mapa = await repo.buscarCorrecoesPorColecao('itens');

    expect(mapa.get('x')?.get('nome.pt')?.valor).toBe('B');
  });

  it('salvar grava uma entrada de auditoria', async () => {
    await repo.salvarCorrecao({ colecao: 'itens', registroId: 'x', campo: 'nome.pt', valor: 'A', valorBase: 'base', autor: '1' });

    const linhas = await auditoria.listarAuditoria();

    expect(linhas).toHaveLength(1);
    expect(linhas[0]).toMatchObject({ acao: 'correcao.criar', alvo: 'itens/x/nome.pt', valorNovo: 'A' });
  });

  it('reverter remove a correção e o valor original volta a valer', async () => {
    await repo.salvarCorrecao({ colecao: 'itens', registroId: 'x', campo: 'nome.pt', valor: 'A', valorBase: 'base', autor: '1' });
    await repo.reverterCorrecao({ colecao: 'itens', registroId: 'x', campo: 'nome.pt', autor: '1' });

    const mapa = await repo.buscarCorrecoesPorColecao('itens');

    expect(mapa.get('x')).toBeUndefined();
  });

  it('reverter grava auditoria mesmo quando não havia correção', async () => {
    await repo.reverterCorrecao({ colecao: 'itens', registroId: 'x', campo: 'nome.pt', autor: '1' });

    const linhas = await auditoria.listarAuditoria();

    expect(linhas).toHaveLength(0);
  });
});
