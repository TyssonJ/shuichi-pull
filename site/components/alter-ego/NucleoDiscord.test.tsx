import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { Session } from 'next-auth';
import { NucleoDiscord } from './NucleoDiscord';

const signInMock = vi.hoisted(() => vi.fn());
vi.mock('next-auth/react', async (importOriginal) => {
  const mod = await importOriginal<typeof import('next-auth/react')>();
  return { ...mod, signIn: signInMock };
});

const sessaoFalsa: Session = {
  user: { discordId: '123', papel: null, name: 'Makoto Naegi', image: 'https://exemplo.com/avatar.png' },
  expires: '2099-01-01T00:00:00.000Z',
};

describe('NucleoDiscord', () => {
  it('sem sessão, mostra o botão de entrar com Discord', () => {
    render(<NucleoDiscord sessaoInicial={null} />);
    expect(screen.getByRole('button', { name: /entrar com o discord/i })).toBeInTheDocument();
  });

  it('clicar no botão de entrar chama signIn com discord', () => {
    render(<NucleoDiscord sessaoInicial={null} />);
    fireEvent.click(screen.getByRole('button', { name: /entrar com o discord/i }));
    expect(signInMock).toHaveBeenCalledWith('discord');
  });

  it('logado, mostra o avatar do Discord linkando pra conta', () => {
    render(<NucleoDiscord sessaoInicial={sessaoFalsa} />);
    const link = screen.getByRole('link', { name: /conta de makoto naegi/i });
    expect(link).toHaveAttribute('href', '/conta/');
    expect(link.querySelector('img')).toHaveAttribute('src', 'https://exemplo.com/avatar.png');
  });

  it('logado sem avatar do Discord, mostra a inicial do nome', () => {
    const semAvatar: Session = { ...sessaoFalsa, user: { ...sessaoFalsa.user, image: null } };
    render(<NucleoDiscord sessaoInicial={semAvatar} />);
    expect(screen.getByText('M')).toBeInTheDocument();
  });
});
