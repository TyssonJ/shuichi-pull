import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/adm/sessao', () => ({ exigirAdm: vi.fn() }));
vi.mock('@/db/repositorios/codigos', () => ({
  repositorioCodigos: { criar: vi.fn(), atualizar: vi.fn(), excluir: vi.fn(), buscar: vi.fn() },
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import { exigirAdm } from '@/lib/adm/sessao';
import { repositorioCodigos } from '@/db/repositorios/codigos';
import { revalidatePath } from 'next/cache';
import { salvarCodigo, excluirCodigo } from './acoes';

const codigoValido = {
  codigo: 'BEMVINDO2026', recompensa: '500 moedas', descricao: 'código de teste',
  expiraEm: null, fonte: null, iconeUrl: null,
};

describe('salvarCodigo', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejeita sem sessão de adm', async () => {
    vi.mocked(exigirAdm).mockRejectedValue(new Error('Acesso negado'));
    await expect(salvarCodigo(codigoValido)).rejects.toThrow('Acesso negado');
  });

  it('rejeita dado inválido antes de tocar o banco', async () => {
    vi.mocked(exigirAdm).mockResolvedValue({ discordId: '1', papel: 'adm' });
    await expect(salvarCodigo({ ...codigoValido, codigo: '' })).rejects.toThrow();
    expect(repositorioCodigos.criar).not.toHaveBeenCalled();
  });

  it('cria o código e revalida a listagem', async () => {
    vi.mocked(exigirAdm).mockResolvedValue({ discordId: '1', papel: 'adm' });
    vi.mocked(repositorioCodigos.buscar).mockResolvedValue(null);

    await salvarCodigo(codigoValido);

    expect(repositorioCodigos.criar).toHaveBeenCalledWith(codigoValido);
    expect(revalidatePath).toHaveBeenCalledWith('/codigos');
  });

  it('atualiza em vez de criar quando o código já existe', async () => {
    vi.mocked(exigirAdm).mockResolvedValue({ discordId: '1', papel: 'adm' });
    vi.mocked(repositorioCodigos.buscar).mockResolvedValue(codigoValido);

    await salvarCodigo(codigoValido);

    expect(repositorioCodigos.atualizar).toHaveBeenCalledWith('BEMVINDO2026', codigoValido);
    expect(repositorioCodigos.criar).not.toHaveBeenCalled();
  });
});

describe('excluirCodigo', () => {
  beforeEach(() => vi.clearAllMocks());

  it('exclui e revalida a listagem', async () => {
    vi.mocked(exigirAdm).mockResolvedValue({ discordId: '1', papel: 'adm' });

    await excluirCodigo('BEMVINDO2026');

    expect(repositorioCodigos.excluir).toHaveBeenCalledWith('BEMVINDO2026');
    expect(revalidatePath).toHaveBeenCalledWith('/codigos');
  });
});
