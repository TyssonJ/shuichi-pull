import { describe, it, expect, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CarteirinhaEstudante } from './CarteirinhaEstudante';
import type { Personagem } from '@/lib/schema';

const chihiro: Personagem = {
  id: 'chihiro-fujisaki',
  nome: 'Chihiro Fujisaki',
  talento: { pt: 'Programação Suprema', en: 'Ultimate Programmer' },
  descricao: { pt: 'Frágil e tímida.', en: 'Fragile and shy.' },
  jogo: 'Danganronpa: Trigger Happy Havoc',
  velocidade: 180, mochila: 13, percepcao: 9, vida: 100,
  etiquetas: [], sprite: '/sprites/chihiro.webp', traducaoRevisada: true,
};

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

describe('CarteirinhaEstudante', () => {
  afterEach(() => {
    mockarMovimentoReduzido(false);
  });

  it('mostra o sprite do personagem', () => {
    mockarMovimentoReduzido(false);
    render(<CarteirinhaEstudante personagem={chihiro} numero={1} />);
    expect(screen.getByAltText('Sprite de Chihiro Fujisaki')).toHaveAttribute(
      'src', '/sprites/chihiro.webp'
    );
  });

  it('mostra o Student ID com zero-padding de 3 dígitos', () => {
    mockarMovimentoReduzido(false);
    render(<CarteirinhaEstudante personagem={chihiro} numero={7} />);
    expect(screen.getByText('[ STUDENT ID: #007 ]')).toBeInTheDocument();
  });

  it('mostra o laser quando o usuário não pediu menos movimento', () => {
    mockarMovimentoReduzido(false);
    render(<CarteirinhaEstudante personagem={chihiro} numero={1} />);
    expect(screen.getByTestId('laser')).toBeInTheDocument();
  });

  it('não mostra o laser quando o usuário pediu menos movimento', () => {
    mockarMovimentoReduzido(true);
    render(<CarteirinhaEstudante personagem={chihiro} numero={1} />);
    expect(screen.queryByTestId('laser')).not.toBeInTheDocument();
  });

  it('gera o mesmo código de barras em duas montagens (seed estável a partir do id)', () => {
    mockarMovimentoReduzido(false);
    const { container: c1 } = render(<CarteirinhaEstudante personagem={chihiro} numero={1} />);
    const larguras1 = [...c1.querySelectorAll('[data-testid="codigo-barras"] rect')]
      .map((r) => r.getAttribute('width'));

    const { container: c2 } = render(<CarteirinhaEstudante personagem={chihiro} numero={1} />);
    const larguras2 = [...c2.querySelectorAll('[data-testid="codigo-barras"] rect')]
      .map((r) => r.getAttribute('width'));

    expect(larguras1.length).toBeGreaterThan(0);
    expect(larguras1).toEqual(larguras2);
  });
});
