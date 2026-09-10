import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/lib/dados', () => ({
  listarPersonagens: vi.fn().mockReturnValue([
    {
      id: 'aaa', nome: 'Aaa', talento: { pt: 'X', en: 'X' },
      descricao: { pt: 'd', en: 'd' }, jogo: 'Jogo B',
      velocidade: 100, mochila: 1, percepcao: 1, vida: 1,
      etiquetas: [], sprite: '/s.webp', traducaoRevisada: true,
    },
    {
      id: 'bbb', nome: 'Bbb', talento: { pt: 'Y', en: 'Y' },
      descricao: { pt: 'd', en: 'd' }, jogo: 'Jogo A',
      velocidade: 100, mochila: 1, percepcao: 1, vida: 1,
      etiquetas: [], sprite: '/s.webp', traducaoRevisada: true,
    },
  ]),
}));

import PaginaElenco from './page';

describe('Página de Elenco', () => {
  it('numera cada personagem pela ordem global de listarPersonagens, não pelo agrupamento por jogo', () => {
    render(<PaginaElenco />);
    // "Aaa" é o primeiro no array (Jogo B) e "Bbb" é o segundo (Jogo A) —
    // se a numeração seguisse o agrupamento por jogo (que reordena "Jogo A"
    // antes de "Jogo B" na exibição), a numeração bateria errado.
    expect(screen.getByText('[ STUDENT ID: #001 ]')).toBeInTheDocument();
    expect(screen.getByText('[ STUDENT ID: #002 ]')).toBeInTheDocument();
  });
});
