import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { urlBancoTeste, clienteTeste, limparTabelas } from '../testes/ambiente';
import { criarRepositorioAdms } from './administradores';

const rodar = urlBancoTeste() ? describe : describe.skip;

rodar('repositório de administradores (integração)', () => {
  // `describe.skip` ainda executa o corpo da suíte na fase de coleta do
  // Vitest (apenas os `it`s dentro são pulados) — sem este retorno antecipado,
  // `clienteTeste()` lançaria um erro de coleta mesmo com a suíte marcada
  // como skip, quando DATABASE_URL_TEST não está configurada.
  if (!urlBancoTeste()) return;

  const { db, client } = clienteTeste();
  const repo = criarRepositorioAdms(db);

  beforeEach(async () => {
    await limparTabelas(db);
  });

  afterAll(async () => {
    await client.end();
  });

  it('devolve null para quem não é administrador', async () => {
    expect(await repo.buscarAdm('000')).toBeNull();
  });

  it('promove alguém e depois consegue buscar', async () => {
    await repo.promoverAdm({ discordId: '111', nome: 'Fulano', papel: 'adm', promovidoPor: '999' });

    const encontrado = await repo.buscarAdm('111');

    expect(encontrado).toMatchObject({ nome: 'Fulano', papel: 'adm' });
  });

  it('rebaixar remove o acesso', async () => {
    await repo.promoverAdm({ discordId: '111', nome: 'Fulano', papel: 'adm', promovidoPor: '999' });
    await repo.rebaixarAdm('111');

    expect(await repo.buscarAdm('111')).toBeNull();
  });

  it('lista todos os administradores', async () => {
    await repo.promoverAdm({ discordId: '111', nome: 'A', papel: 'adm', promovidoPor: '999' });
    await repo.promoverAdm({ discordId: '222', nome: 'B', papel: 'chefe', promovidoPor: null });

    const lista = await repo.listarAdms();

    expect(lista.map((a) => a.discordId).sort()).toEqual(['111', '222']);
  });
});
