import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/adm/sessao', () => ({ exigirChefe: vi.fn() }));
vi.mock('@/db/repositorios/administradores', () => ({
  repositorioAdms: { promoverAdm: vi.fn(), rebaixarAdm: vi.fn() },
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import { exigirChefe } from '@/lib/adm/sessao';
import { repositorioAdms } from '@/db/repositorios/administradores';
import { promoverAdmAction, rebaixarAdmAction } from './acoes';

describe('promoverAdmAction', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejeita quando quem chama não é chefe', async () => {
    vi.mocked(exigirChefe).mockRejectedValue(new Error('Acesso negado'));
    await expect(promoverAdmAction({ discordId: '1', nome: 'Novo', papel: 'adm' })).rejects.toThrow('Acesso negado');
  });

  it('promove registrando quem promoveu', async () => {
    vi.mocked(exigirChefe).mockResolvedValue({ discordId: '9', papel: 'chefe' });

    await promoverAdmAction({ discordId: '1', nome: 'Novo', papel: 'adm' });

    expect(repositorioAdms.promoverAdm).toHaveBeenCalledWith({
      discordId: '1', nome: 'Novo', papel: 'adm', promovidoPor: '9',
    });
  });
});

describe('rebaixarAdmAction', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejeita quando quem chama não é chefe', async () => {
    vi.mocked(exigirChefe).mockRejectedValue(new Error('Acesso negado'));
    await expect(rebaixarAdmAction('1')).rejects.toThrow('Acesso negado');
  });

  it('rebaixa', async () => {
    vi.mocked(exigirChefe).mockResolvedValue({ discordId: '9', papel: 'chefe' });
    await rebaixarAdmAction('1');
    expect(repositorioAdms.rebaixarAdm).toHaveBeenCalledWith('1');
  });
});
