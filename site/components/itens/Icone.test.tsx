import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Icone } from './Icone';

describe('Icone', () => {
  it('mostra a arte quando o item tem ícone', () => {
    render(<Icone src="/icones/small-parts.webp" nome="Peças Miúdas" />);
    expect(screen.getByRole('img', { name: /peças miúdas/i })).toHaveAttribute(
      'src', '/icones/small-parts.webp'
    );
  });

  it('cai numa marca com a inicial quando não há ícone', () => {
    render(<Icone src={null} nome="Impressão Digital" />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('I')).toBeInTheDocument();
  });

  it('esconde o fallback do leitor de tela, que já tem o nome ao lado', () => {
    const { container } = render(<Icone src={null} nome="Chave" />);
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });
});
