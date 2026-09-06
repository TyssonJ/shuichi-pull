import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Receita } from './Receita';
import type { Craft } from '@/lib/schema-itens';

const craft: Craft = {
  ingredientes: [
    { id: 'rusty-scrap-metal', nome: { pt: 'Sucata Enferrujada', en: 'Rusty Scrap Metal' }, qtd: 3, icone: '/icones/scrap-rust.webp' },
    { id: null, nome: { pt: 'Pano', en: 'Rag' }, qtd: 1, icone: null },
  ],
  bancadas: [{ pt: 'Bancada', en: 'Workbench' }],
  chance: '100%',
};

describe('Receita', () => {
  it('mostra cada ingrediente com a quantidade', () => {
    render(<Receita craft={craft} resultado="Peças Miúdas" />);
    expect(screen.getByText('Sucata Enferrujada')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Pano')).toBeInTheDocument();
  });

  it('mostra a bancada e a chance no cabeçalho', () => {
    render(<Receita craft={craft} resultado="Peças Miúdas" />);
    expect(screen.getByText(/Bancada/)).toBeInTheDocument();
    expect(screen.getByText(/100%/)).toBeInTheDocument();
  });

  it('destaca o resultado da fórmula', () => {
    render(<Receita craft={craft} resultado="Peças Miúdas" />);
    expect(screen.getByTestId('resultado')).toHaveTextContent('Peças Miúdas');
  });

  it('liga o ingrediente que tem ficha própria', () => {
    render(<Receita craft={craft} resultado="Peças Miúdas" />);
    expect(screen.getByRole('link', { name: /Sucata Enferrujada/ }))
      .toHaveAttribute('href', expect.stringContaining('/itens/rusty-scrap-metal'));
  });

  it('não vira link o ingrediente sem ficha', () => {
    render(<Receita craft={craft} resultado="Peças Miúdas" />);
    expect(screen.queryByRole('link', { name: /^Pano/ })).not.toBeInTheDocument();
  });

  it('descreve a receita inteira para leitor de tela', () => {
    render(<Receita craft={craft} resultado="Peças Miúdas" />);
    expect(screen.getByRole('group')).toHaveAccessibleName(
      /3 Sucata Enferrujada.*1 Pano.*Peças Miúdas/
    );
  });
});
