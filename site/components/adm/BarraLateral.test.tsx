import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BarraLateral } from './BarraLateral';

describe('BarraLateral', () => {
  it('mostra os itens comuns para um adm', () => {
    render(<BarraLateral papel="adm" />);
    expect(screen.getByRole('link', { name: 'Eventos' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Códigos' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Itens' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Personagens' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Mapa' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Mecânicas' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Textos' })).toBeInTheDocument();
  });

  it('esconde ADMs e Auditoria para quem não é chefe', () => {
    render(<BarraLateral papel="adm" />);
    expect(screen.queryByRole('link', { name: 'ADMs' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Auditoria' })).not.toBeInTheDocument();
  });

  it('mostra ADMs e Auditoria para chefe', () => {
    render(<BarraLateral papel="chefe" />);
    expect(screen.getByRole('link', { name: 'ADMs' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Auditoria' })).toBeInTheDocument();
  });
});
