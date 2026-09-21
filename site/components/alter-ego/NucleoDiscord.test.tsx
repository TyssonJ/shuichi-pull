import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { Session } from 'next-auth';
import { NucleoDiscord } from './NucleoDiscord';

const pathnameMock = vi.hoisted(() => vi.fn(() => '/'));
vi.mock('next/navigation', () => ({ usePathname: pathnameMock }));

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
    expect(link).toHaveAttribute('href', '/u/123/');
    expect(link.querySelector('img')).toHaveAttribute('src', 'https://exemplo.com/avatar.png');
  });

  it('logado sem avatar do Discord, mostra a inicial do nome', () => {
    const semAvatar: Session = { ...sessaoFalsa, user: { ...sessaoFalsa.user, image: null } };
    render(<NucleoDiscord sessaoInicial={semAvatar} />);
    expect(screen.getByText('M')).toBeInTheDocument();
  });

  describe('atalho de edição (só ADM)', () => {
    const adm: Session = { ...sessaoFalsa, user: { ...sessaoFalsa.user, papel: 'adm' } };

    it('ADM na página de um personagem vê o botão que abre o editor naquele registro', () => {
      pathnameMock.mockReturnValue('/elenco/kaede-akamatsu/');
      render(<NucleoDiscord sessaoInicial={adm} />);
      expect(screen.getByRole('link', { name: /editar/i })).toHaveAttribute(
        'href', '/adm/personagens/?abrir=kaede-akamatsu',
      );
    });

    it('quem não é ADM não vê o botão', () => {
      pathnameMock.mockReturnValue('/faq/');
      render(<NucleoDiscord sessaoInicial={sessaoFalsa} />);
      expect(screen.queryByRole('link', { name: /editar/i })).toBeNull();
    });

    it('dentro do painel não aparece (já está editando)', () => {
      pathnameMock.mockReturnValue('/adm/faq/');
      render(<NucleoDiscord sessaoInicial={adm} />);
      expect(screen.queryByRole('link', { name: /editar/i })).toBeNull();
    });
  });

  describe('apelido e ícone escolhidos no site', () => {
    const custom: Session = {
      ...sessaoFalsa,
      user: { ...sessaoFalsa.user, apelido: 'Shuichi', avatarUrl: '/sprites/elenco/shuichi.webp' },
    };

    it('mostra o ícone personalizado em destaque e o do Discord pequeno ao lado', () => {
      render(<NucleoDiscord sessaoInicial={custom} />);
      const link = screen.getByRole('link', { name: /conta de shuichi/i });
      const imagens = [...link.querySelectorAll('img')].map((i) => i.getAttribute('src'));
      expect(imagens).toEqual(['/sprites/elenco/shuichi.webp', 'https://exemplo.com/avatar.png']);
      expect(link.querySelector('img[title="Seu ícone do Discord"]')).not.toBeNull();
    });

    it('sem personalização não repete o ícone do Discord', () => {
      render(<NucleoDiscord sessaoInicial={sessaoFalsa} />);
      expect(screen.getByRole('link', { name: /conta de makoto naegi/i }).querySelectorAll('img')).toHaveLength(1);
    });
  });
});
