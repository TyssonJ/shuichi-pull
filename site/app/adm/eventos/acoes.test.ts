import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/adm/sessao', () => ({ exigirAdm: vi.fn() }));
vi.mock('@/db/repositorios/eventos', () => ({
  repositorioEventos: { criar: vi.fn(), atualizar: vi.fn(), excluir: vi.fn(), buscar: vi.fn() },
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import { exigirAdm } from '@/lib/adm/sessao';
import { repositorioEventos } from '@/db/repositorios/eventos';
import { revalidatePath } from 'next/cache';
import { salvarEvento, excluirEvento } from './acoes';

const eventoValido = {
  id: 'evento-teste', tipo: 'noticia' as const, titulo: 'Título', data: '2026-01-01',
  ate: null, destaque: false, autor: 'admin', resumo: 'resumo', corpo: 'corpo', imagemUrl: null,
};

describe('salvarEvento', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejeita sem sessão de adm', async () => {
    vi.mocked(exigirAdm).mockRejectedValue(new Error('Acesso negado'));
    await expect(salvarEvento(eventoValido)).rejects.toThrow('Acesso negado');
  });

  it('rejeita dado inválido antes de tocar o banco', async () => {
    vi.mocked(exigirAdm).mockResolvedValue({ discordId: '1', papel: 'adm' });
    await expect(salvarEvento({ ...eventoValido, data: 'não é uma data' })).rejects.toThrow();
    expect(repositorioEventos.criar).not.toHaveBeenCalled();
  });

  it('cria o evento e revalida as páginas afetadas', async () => {
    vi.mocked(exigirAdm).mockResolvedValue({ discordId: '1', papel: 'adm' });
    vi.mocked(repositorioEventos.buscar).mockResolvedValue(null);

    await salvarEvento(eventoValido);

    expect(repositorioEventos.criar).toHaveBeenCalledWith(eventoValido);
    expect(repositorioEventos.atualizar).not.toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith('/eventos');
    expect(revalidatePath).toHaveBeenCalledWith('/eventos/evento-teste');
  });

  it('atualiza em vez de criar quando o evento já existe', async () => {
    vi.mocked(exigirAdm).mockResolvedValue({ discordId: '1', papel: 'adm' });
    vi.mocked(repositorioEventos.buscar).mockResolvedValue(eventoValido);

    await salvarEvento(eventoValido);

    expect(repositorioEventos.atualizar).toHaveBeenCalledWith('evento-teste', eventoValido);
    expect(repositorioEventos.criar).not.toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith('/eventos');
    expect(revalidatePath).toHaveBeenCalledWith('/eventos/evento-teste');
  });
});

describe('excluirEvento', () => {
  beforeEach(() => vi.clearAllMocks());

  it('exclui e revalida a listagem', async () => {
    vi.mocked(exigirAdm).mockResolvedValue({ discordId: '1', papel: 'adm' });

    await excluirEvento('evento-teste');

    expect(repositorioEventos.excluir).toHaveBeenCalledWith('evento-teste');
    expect(revalidatePath).toHaveBeenCalledWith('/eventos');
  });
});
