import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/auth', () => ({ auth: vi.fn(), signIn: vi.fn() }));
import { auth } from '@/auth';
import SemAcesso from './page';

describe('SemAcesso', () => {
  beforeEach(() => vi.clearAllMocks());

  it('convida para login com Discord quando não há sessão', async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

    const elemento = await SemAcesso();
    render(elemento);

    expect(
      screen.getByRole('button', { name: /discord/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/não está na lista de administradores/i)
    ).not.toBeInTheDocument();
  });

  it('mostra mensagem de não-adm quando há sessão mas não é administrador', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { discordId: '123', papel: null },
      expires: '2099-01-01T00:00:00.000Z',
    } as never);

    const elemento = await SemAcesso();
    render(elemento);

    expect(
      screen.getByText(/não está na lista de administradores/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /discord/i })
    ).not.toBeInTheDocument();
  });
});
