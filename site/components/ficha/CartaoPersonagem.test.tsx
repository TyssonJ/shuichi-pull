import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CartaoPersonagem } from './CartaoPersonagem';
import type { Personagem } from '@/lib/schema';

const chihiro: Personagem = {
  id: 'chihiro-fujisaki',
  nome: 'Chihiro Fujisaki',
  talento: { pt: 'Programação Suprema', en: 'Ultimate Programmer' },
  descricao: { pt: 'Frágil e tímida.', en: 'Fragile and shy.' },
  jogo: 'Danganronpa: Trigger Happy Havoc',
  velocidade: 180, mochila: 13, percepcao: 9, vida: 100,
  etiquetas: [], sprite: '/sprites/chihiro.webp', traducaoRevisada: false,
};

describe('CartaoPersonagem', () => {
  it('mostra nome e talento em português', () => {
    render(<CartaoPersonagem personagem={chihiro} />);
    expect(screen.getByText('Chihiro Fujisaki')).toBeInTheDocument();
    expect(screen.getByText('Programação Suprema')).toBeInTheDocument();
  });

  it('mostra o talento em inglês junto, como manda a spec', () => {
    render(<CartaoPersonagem personagem={chihiro} />);
    expect(screen.getByText('Ultimate Programmer')).toBeInTheDocument();
  });

  // Fora do build o next/link normaliza a barra final: o trailingSlash do
  // next.config.ts nao vale no jsdom. No site exportado a barra esta la.
  it('leva para a ficha do personagem', () => {
    render(<CartaoPersonagem personagem={chihiro} />);
    expect(screen.getByRole('link').getAttribute('href')).toMatch(
      /^\/elenco\/chihiro-fujisaki\/?$/
    );
  });

  it('marca a tradução não revisada', () => {
    render(<CartaoPersonagem personagem={chihiro} />);
    expect(screen.getByTitle(/tradução não revisada/i)).toBeInTheDocument();
  });
});
