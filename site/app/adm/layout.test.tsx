import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/lib/adm/sessao', () => ({ sessaoAdm: vi.fn() }));
vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => { throw new Error('REDIRECT'); }),
  usePathname: vi.fn(() => '/adm/'),
}));
import { sessaoAdm } from '@/lib/adm/sessao';
import { redirect } from 'next/navigation';
import AdmLayout from './layout';

describe('AdmLayout', () => {
  beforeEach(() => vi.clearAllMocks());

  it('redireciona para sem-acesso quando não há sessão de adm', async () => {
    vi.mocked(sessaoAdm).mockResolvedValue(null);

    await expect(AdmLayout({ children: <p>oi</p> })).rejects.toThrow('REDIRECT');
    expect(redirect).toHaveBeenCalledWith('/sem-acesso');
  });

  it('renderiza o conteúdo quando há sessão de adm', async () => {
    vi.mocked(sessaoAdm).mockResolvedValue({ discordId: '1', papel: 'adm' });

    const elemento = await AdmLayout({ children: <p>painel aqui</p> });
    render(elemento);

    expect(screen.getByText('painel aqui')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Eventos' })).toBeInTheDocument();
  });
});
