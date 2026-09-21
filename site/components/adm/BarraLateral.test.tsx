import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { BarraLateral } from './BarraLateral';

vi.mock('next/navigation', () => ({ usePathname: vi.fn(() => '/adm/') }));

describe('BarraLateral', () => {
  beforeEach(() => vi.mocked(usePathname).mockReturnValue('/adm/'));

  it('mostra os itens comuns para um adm', () => {
    render(<BarraLateral papel="adm" />);
    for (const nome of ['Painel', 'Partidas', 'Usuários', 'Eventos', 'Códigos', 'Itens', 'Personagens', 'Mapa', 'Mecânicas', 'Cargos', 'Conquistas', 'FAQ', 'Textos', 'Configurações']) {
      expect(screen.getByRole('link', { name: nome })).toBeInTheDocument();
    }
  });

  it('esconde ADMs, Auditoria e Junko Bot para quem não é chefe', () => {
    render(<BarraLateral papel="adm" />);
    expect(screen.queryByRole('link', { name: 'Junko Bot' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'ADMs' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Auditoria' })).not.toBeInTheDocument();
  });

  it('mostra ADMs, Auditoria e Junko Bot para chefe', () => {
    render(<BarraLateral papel="chefe" />);
    expect(screen.getByRole('link', { name: 'Junko Bot' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'ADMs' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Auditoria' })).toBeInTheDocument();
  });

  it('marca a página atual, com ou sem barra final na URL', () => {
    vi.mocked(usePathname).mockReturnValue('/adm/itens/');
    render(<BarraLateral papel="adm" />);
    expect(screen.getByRole('link', { name: 'Itens' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Painel' })).not.toHaveAttribute('aria-current');
  });

  it('o Painel só acende na raiz, não em toda página do admin', () => {
    vi.mocked(usePathname).mockReturnValue('/adm');
    render(<BarraLateral papel="adm" />);
    expect(screen.getByRole('link', { name: 'Painel' })).toHaveAttribute('aria-current', 'page');
  });

  it('uma subpágina acende a seção dela', () => {
    vi.mocked(usePathname).mockReturnValue('/adm/partidas/12/');
    render(<BarraLateral papel="adm" />);
    expect(screen.getByRole('link', { name: 'Partidas' })).toHaveAttribute('aria-current', 'page');
  });
});
