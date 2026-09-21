import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuemJogaDeMain } from './QuemJogaDeMain';

describe('QuemJogaDeMain', () => {
  it('lista quem joga de main, com contagem e link pro perfil de cada um', () => {
    render(
      <QuemJogaDeMain
        jogadores={[
          { discordId: '111', nome: 'Shuichi', avatar: '/s.webp' },
          { discordId: '222', nome: 'Kaede', avatar: null },
        ]}
      />,
    );
    expect(screen.getByText(/QUEM JOGA DE MAIN \(2\)/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Shuichi' }).getAttribute('href')).toMatch(/^\/u\/111\/?$/);
    expect(screen.getByRole('link', { name: 'Kaede' }).getAttribute('href')).toMatch(/^\/u\/222\/?$/);
  });

  it('sem ninguém: convida a marcar o seu em Minha conta', () => {
    render(<QuemJogaDeMain jogadores={[]} />);
    expect(screen.getByText(/Ninguém marcou como main ainda/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Minha conta' }).getAttribute('href')).toMatch(/^\/conta\/?$/);
    expect(screen.queryByText(/\(0\)/)).toBeNull();
  });
});
