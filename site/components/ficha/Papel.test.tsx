import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Papel } from './Papel';

describe('Papel', () => {
  it('mostra o conteúdo dentro', () => {
    render(<Papel><p>conteúdo da ficha</p></Papel>);
    expect(screen.getByText('conteúdo da ficha')).toBeInTheDocument();
  });

  it('mostra o título quando recebe um', () => {
    render(<Papel titulo="COMO JOGAR"><p>x</p></Papel>);
    expect(screen.getByRole('heading', { name: 'COMO JOGAR' })).toBeInTheDocument();
  });

  it('usa o creme como fundo do papel, nunca da página', () => {
    const { container } = render(<Papel><p>x</p></Papel>);
    expect(container.firstChild).toHaveClass('bg-papel');
  });
});
