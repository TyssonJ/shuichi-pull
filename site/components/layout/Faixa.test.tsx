import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Faixa } from './Faixa';

describe('Faixa', () => {
  const props = {
    numero: '01', titulo: 'ELENCO', descricao: '56 alunos.',
    url: '/elenco/', variante: 'teal' as const,
  };

  it('mostra número, título e descrição', () => {
    render(<Faixa {...props} />);
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'ELENCO' })).toBeInTheDocument();
    expect(screen.getByText('56 alunos.')).toBeInTheDocument();
  });

  // O next/link normaliza a barra final fora do build; no site exportado ela fica.
  it('a faixa inteira é o link', () => {
    render(<Faixa {...props} />);
    expect(screen.getByRole('link', { name: /elenco/i }).getAttribute('href'))
      .toMatch(/^\/elenco\/?$/);
  });

  it('marca o sprite decorativo como escondido para leitor de tela', () => {
    render(<Faixa {...props} sprite="/sprites/junko.webp" />);
    expect(screen.getByTestId('sprite-faixa')).toHaveAttribute('aria-hidden', 'true');
  });
});
