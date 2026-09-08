import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/adm/sessao', () => ({ exigirAdm: vi.fn() }));
vi.mock('@/db/repositorios/correcoes', () => ({
  repositorioCorrecoes: { salvarCorrecao: vi.fn(), reverterCorrecao: vi.fn() },
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import { exigirAdm } from '@/lib/adm/sessao';
import { repositorioCorrecoes } from '@/db/repositorios/correcoes';
import { revalidatePath } from 'next/cache';
import { salvarCorrecaoAction, reverterCorrecaoAction } from './correcoes-acoes';

describe('salvarCorrecaoAction', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejeita sem sessão', async () => {
    vi.mocked(exigirAdm).mockRejectedValue(new Error('Acesso negado'));
    await expect(salvarCorrecaoAction('itens', {
      registroId: 'x', campo: 'nome.pt', valor: 'A', valorBase: 'base',
    })).rejects.toThrow('Acesso negado');
  });

  it('salva com o autor da sessão e revalida a listagem, o detalhe e a própria página adm', async () => {
    vi.mocked(exigirAdm).mockResolvedValue({ discordId: '9', papel: 'adm' });

    await salvarCorrecaoAction('itens', { registroId: 'x', campo: 'nome.pt', valor: 'A', valorBase: 'base' });

    expect(repositorioCorrecoes.salvarCorrecao).toHaveBeenCalledWith({
      colecao: 'itens', registroId: 'x', campo: 'nome.pt', valor: 'A', valorBase: 'base', autor: '9',
    });
    expect(revalidatePath).toHaveBeenCalledWith('/itens');
    expect(revalidatePath).toHaveBeenCalledWith('/itens/x');
    expect(revalidatePath).toHaveBeenCalledWith('/adm/itens');
  });

  it('revalida sem sufixo de detalhe para colecoes sem pagina de item (faq/controles)', async () => {
    vi.mocked(exigirAdm).mockResolvedValue({ discordId: '9', papel: 'adm' });

    await salvarCorrecaoAction('faq', { registroId: 'x', campo: 'resposta', valor: 'A', valorBase: 'base' });

    expect(revalidatePath).toHaveBeenCalledWith('/faq');
    expect(revalidatePath).not.toHaveBeenCalledWith('/faq/x');
    expect(revalidatePath).toHaveBeenCalledWith('/adm/faq');
  });

  it('revalida a página adm de mapa/mecanicas com o nome de rota correto (não bate com o nome da coleção)', async () => {
    vi.mocked(exigirAdm).mockResolvedValue({ discordId: '9', papel: 'adm' });

    await salvarCorrecaoAction('locais', { registroId: 'x', campo: 'nome', valor: 'A', valorBase: 'base' });
    await salvarCorrecaoAction('controles', { registroId: 'y', campo: 'texto', valor: 'A', valorBase: 'base' });

    expect(revalidatePath).toHaveBeenCalledWith('/adm/mapa');
    expect(revalidatePath).toHaveBeenCalledWith('/adm/mecanicas');
  });
});

describe('reverterCorrecaoAction', () => {
  beforeEach(() => vi.clearAllMocks());

  it('reverte com o autor da sessão e revalida a própria página adm', async () => {
    vi.mocked(exigirAdm).mockResolvedValue({ discordId: '9', papel: 'adm' });

    await reverterCorrecaoAction('personagens', { registroId: 'y', campo: 'nome' });

    expect(repositorioCorrecoes.reverterCorrecao).toHaveBeenCalledWith({
      colecao: 'personagens', registroId: 'y', campo: 'nome', autor: '9',
    });
    expect(revalidatePath).toHaveBeenCalledWith('/elenco');
    expect(revalidatePath).toHaveBeenCalledWith('/elenco/y');
    expect(revalidatePath).toHaveBeenCalledWith('/adm/personagens');
  });
});
