import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CartaoItem } from './CartaoItem';
import { buscarItem } from '@/lib/itens';
import { resumirItem } from '@/lib/itens-resumo';

const item = resumirItem(buscarItem('small-parts')!);

describe('CartaoItem', () => {
  it('mostra o nome em PT com o inglês junto', () => {
    render(<CartaoItem item={item} />);
    expect(screen.getByText('Peças Miúdas')).toBeInTheDocument();
    expect(screen.getByText('Small Parts')).toBeInTheDocument();
  });

  it('mostra a raridade escrita', () => {
    render(<CartaoItem item={item} />);
    expect(screen.getByText('Incomum')).toBeInTheDocument();
  });

  it('leva para a ficha do item', () => {
    render(<CartaoItem item={item} />);
    expect(screen.getByRole('link').getAttribute('href'))
      .toMatch(/^\/itens\/small-parts\/?$/);
  });

  it('avisa quando dá para fabricar', () => {
    render(<CartaoItem item={item} />);
    expect(screen.getByTitle(/dá para fabricar/i)).toBeInTheDocument();
  });
});
