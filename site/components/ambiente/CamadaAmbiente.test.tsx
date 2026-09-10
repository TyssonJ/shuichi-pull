import { describe, it, expect, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CamadaAmbiente } from './CamadaAmbiente';

function mockarMovimentoReduzido(reduzido: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: reduzido && query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

describe('CamadaAmbiente', () => {
  afterEach(() => {
    mockarMovimentoReduzido(false);
  });

  it('mostra o texto do marquee de fundo', () => {
    mockarMovimentoReduzido(false);
    render(<CamadaAmbiente />);
    expect(screen.getAllByText(/NON-STOP DEBATE/i).length).toBeGreaterThan(0);
  });

  it('renderiza partículas quando o usuário não pediu menos movimento', () => {
    mockarMovimentoReduzido(false);
    const { container } = render(<CamadaAmbiente />);
    expect(container.querySelectorAll('[data-testid="particula"]').length).toBeGreaterThan(0);
  });

  it('não renderiza partículas quando o usuário pediu menos movimento', () => {
    mockarMovimentoReduzido(true);
    const { container } = render(<CamadaAmbiente />);
    expect(container.querySelectorAll('[data-testid="particula"]').length).toBe(0);
  });

  it('nunca captura clique — a camada inteira é pointer-events-none', () => {
    mockarMovimentoReduzido(false);
    const { container } = render(<CamadaAmbiente />);
    expect(container.firstChild).toHaveClass('pointer-events-none');
  });
});
