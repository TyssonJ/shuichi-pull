import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Selo } from './Selo';

describe('Selo de raridade', () => {
  it('escreve a raridade em português, não só a cor', () => {
    render(<Selo raridade={{ pt: 'Lendário', en: 'Legendary' }} nivel={5} />);
    expect(screen.getByText('Lendário')).toBeInTheDocument();
  });

  it('sobe a intensidade conforme o nível', () => {
    const { container: comum } = render(<Selo raridade={{ pt: 'Comum', en: 'Common' }} nivel={1} />);
    const { container: lendario } = render(<Selo raridade={{ pt: 'Lendário', en: 'Legendary' }} nivel={5} />);
    expect(comum.firstChild).toHaveAttribute('data-nivel', '1');
    expect(lendario.firstChild).toHaveAttribute('data-nivel', '5');
  });

  it('mostra o inglês junto quando pedido', () => {
    render(<Selo raridade={{ pt: 'Raro', en: 'Rare' }} nivel={3} comIngles />);
    expect(screen.getByText('Rare')).toBeInTheDocument();
  });

  it('aguenta raridade não informada', () => {
    render(<Selo raridade={{ pt: 'Não informada', en: 'Unknown' }} nivel={0} />);
    expect(screen.getByText('Não informada')).toBeInTheDocument();
  });
});
