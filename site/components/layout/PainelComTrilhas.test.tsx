import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  usePathname: () => '/itens/',
}));

import { PainelComTrilhas } from './PainelComTrilhas';

describe('PainelComTrilhas', () => {
  it('mostra o conteúdo recebido na coluna central', () => {
    render(<PainelComTrilhas><p>conteúdo da página</p></PainelComTrilhas>);
    expect(screen.getByText('conteúdo da página')).toBeInTheDocument();
  });

  it('mostra os 8 links de navegação na trilha esquerda', () => {
    render(<PainelComTrilhas><p>x</p></PainelComTrilhas>);
    expect(screen.getByRole('link', { name: /01 \/\/ ELENCO/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /02 \/\/ ITENS/i })).toBeInTheDocument();
  });

  it('destaca a seção atual na nav, baseado no pathname', () => {
    render(<PainelComTrilhas><p>x</p></PainelComTrilhas>);
    const linkAtual = screen.getByRole('link', { name: /02 \/\/ ITENS/i });
    expect(linkAtual.className).toMatch(/execution-pink/);
  });

  it('mostra o feed de log do Alter Ego na trilha direita', () => {
    render(<PainelComTrilhas><p>x</p></PainelComTrilhas>);
    expect(screen.getByTestId('feed-alterego')).toBeInTheDocument();
  });

  it('o feed do Alter Ego é clicável e troca a fala ao clicar (re-scan tátil)', () => {
    render(<PainelComTrilhas><p>x</p></PainelComTrilhas>);
    const feed = screen.getByTestId('feed-alterego');
    const falaAntes = feed.textContent;
    fireEvent.click(feed);
    expect(feed.textContent).not.toBe(falaAntes);
  });

  it('usa <article> como elemento raiz quando a prop as="article" é passada', () => {
    const { container } = render(
      <PainelComTrilhas as="article"><p>x</p></PainelComTrilhas>
    );
    expect(container.querySelector('article')).toBeInTheDocument();
  });

  it('marca a seção atual com aria-current="page"', () => {
    render(<PainelComTrilhas><p>x</p></PainelComTrilhas>);
    expect(screen.getByRole('link', { name: /02 \/\/ ITENS/i })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: /01 \/\/ ELENCO/i })).not.toHaveAttribute('aria-current');
  });

  it('o feed do Alter Ego tem nome acessível estável, independente da fala atual', () => {
    render(<PainelComTrilhas><p>x</p></PainelComTrilhas>);
    expect(
      screen.getByRole('button', { name: /pedir uma nova leitura ao alter ego/i }),
    ).toBeInTheDocument();
  });
});
