import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { JanelaEgo } from './JanelaEgo';

describe('JanelaEgo', () => {
  it('mostra o sprite quando o estado tem arte', () => {
    render(<JanelaEgo estado="ocioso" />);
    expect(screen.getByRole('img', { name: /alter ego/i })).toBeInTheDocument();
  });

  it('mostra o kaomoji quando o estado não tem sprite', () => {
    render(<JanelaEgo estado="erro-404" />);
    expect(screen.getByText('(╥﹏╥)')).toBeInTheDocument();
  });

  it('mostra a fala do estado', () => {
    render(<JanelaEgo estado="erro-404" />);
    expect(screen.getByText('Essa página não existe...')).toBeInTheDocument();
  });

  it('substitui variáveis na fala', () => {
    render(<JanelaEgo estado="busca-com-resultado" variaveis={{ n: 12 }} />);
    expect(screen.getByText('Achei 12 resultados!')).toBeInTheDocument();
  });

  it('esconde a fala no modo compacto', () => {
    render(<JanelaEgo estado="erro-404" compacta />);
    expect(screen.queryByText('Essa página não existe...')).not.toBeInTheDocument();
  });

  it('chama onFechar ao clicar no botão de fechar', async () => {
    const aoFechar = vi.fn();
    render(<JanelaEgo estado="ocioso" onFechar={aoFechar} />);
    screen.getByRole('button', { name: /fechar/i }).click();
    expect(aoFechar).toHaveBeenCalledOnce();
  });
});
