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

  it('renderiza partículas quando o usuário não pediu menos movimento, cada uma com sua cor de acento', () => {
    mockarMovimentoReduzido(false);
    const { container } = render(<CamadaAmbiente />);
    const particulas = container.querySelectorAll('[data-testid="particula"]');
    expect(particulas.length).toBeGreaterThan(0);
    const cores = new Set([...particulas].map((p) => (p as HTMLElement).style.getPropertyValue('--cor')));
    expect(cores.size).toBeGreaterThan(1); // não são todas a mesma cor
  });

  it('não renderiza partículas nem a varredura quando o usuário pediu menos movimento', () => {
    mockarMovimentoReduzido(true);
    const { container } = render(<CamadaAmbiente />);
    expect(container.querySelectorAll('[data-testid="particula"]').length).toBe(0);
    expect(container.querySelector('.animate-varredura')).toBeNull();
  });

  it('a varredura digital existe quando o movimento não está reduzido', () => {
    mockarMovimentoReduzido(false);
    const { container } = render(<CamadaAmbiente />);
    expect(container.querySelector('.animate-varredura')).not.toBeNull();
  });

  it('nunca captura clique — a camada inteira é pointer-events-none', () => {
    mockarMovimentoReduzido(false);
    const { container } = render(<CamadaAmbiente />);
    expect(container.firstChild).toHaveClass('pointer-events-none');
  });
});
