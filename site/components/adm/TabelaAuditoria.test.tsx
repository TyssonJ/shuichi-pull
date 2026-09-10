import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TabelaAuditoria } from './TabelaAuditoria';

const linhas = [
  { id: 1, autor: '1', acao: 'correcao.criar', alvo: 'itens/x/nome.pt', valorAntigo: null, valorNovo: 'Novo', criadoEm: new Date('2026-01-01') },
];

describe('TabelaAuditoria', () => {
  it('mostra cada entrada com autor, ação e alvo', () => {
    render(<TabelaAuditoria linhas={linhas} />);
    expect(screen.getByText('correcao.criar')).toBeInTheDocument();
    expect(screen.getByText('itens/x/nome.pt')).toBeInTheDocument();
  });

  it('mostra estado vazio quando não há entradas', () => {
    render(<TabelaAuditoria linhas={[]} />);
    expect(screen.getByText(/nenhuma entrada/i)).toBeInTheDocument();
  });
});
