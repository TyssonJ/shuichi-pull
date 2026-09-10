import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { urlBancoTeste, clienteTeste, limparTabelas } from '../testes/ambiente';
import { criarRepositorioEventos } from './eventos';

const rodar = urlBancoTeste() ? describe : describe.skip;

rodar('repositório de eventos (integração)', () => {
  // `describe.skip` ainda executa o corpo da suíte na fase de coleta do
  // Vitest (apenas os `it`s dentro são pulados) — sem este retorno antecipado,
  // `clienteTeste()` lançaria um erro de coleta mesmo com a suíte marcada
  // como skip, quando DATABASE_URL_TEST não está configurada.
  if (!urlBancoTeste()) return;

  const { db, client } = clienteTeste();
  const repo = criarRepositorioEventos(db);
  const exemplo = {
    id: 'evento-teste', tipo: 'noticia' as const, titulo: 'Título', data: '2026-01-01',
    ate: null, destaque: false, autor: 'admin', resumo: 'resumo', corpo: 'corpo',
  };

  beforeEach(async () => { await limparTabelas(db); });
  afterAll(async () => { await client.end(); });

  it('cria e lista', async () => {
    await repo.criar(exemplo);
    expect(await repo.listar()).toHaveLength(1);
  });

  it('busca por id', async () => {
    await repo.criar(exemplo);
    expect((await repo.buscar('evento-teste'))?.titulo).toBe('Título');
  });

  it('busca id inexistente devolve null', async () => {
    expect(await repo.buscar('nao-existe')).toBeNull();
  });

  it('atualiza', async () => {
    await repo.criar(exemplo);
    await repo.atualizar('evento-teste', { ...exemplo, titulo: 'Novo título' });
    expect((await repo.buscar('evento-teste'))?.titulo).toBe('Novo título');
  });

  it('exclui', async () => {
    await repo.criar(exemplo);
    await repo.excluir('evento-teste');
    expect(await repo.buscar('evento-teste')).toBeNull();
  });
});
