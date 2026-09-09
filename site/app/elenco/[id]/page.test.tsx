import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// As constantes ficam dentro da própria factory (em vez de no topo do
// arquivo) porque vi.mock é hoisted para o topo do arquivo — referenciar
// consts de nível superior aqui dispararia "Cannot access before
// initialization". O mesmo padrão já é usado em app/elenco/page.test.tsx.
vi.mock('@/lib/dados', () => {
  const aaa = {
    id: 'aaa', nome: 'Aaa', talento: { pt: 'X', en: 'X' },
    descricao: { pt: 'd', en: 'd' }, jogo: 'Jogo A',
    velocidade: 100, mochila: 1, percepcao: 1, vida: 1,
    etiquetas: [], sprite: '/s.webp', traducaoRevisada: true,
  };
  const bbb = {
    id: 'bbb', nome: 'Bbb', talento: { pt: 'Y', en: 'Y' },
    descricao: { pt: 'd', en: 'd' }, jogo: 'Jogo A',
    velocidade: 100, mochila: 1, percepcao: 1, vida: 1,
    etiquetas: [], sprite: '/s.webp', traducaoRevisada: true,
  };
  return {
    listarPersonagens: vi.fn().mockReturnValue([aaa, bbb]),
    buscarPersonagem: vi.fn((id: string) => (id === 'bbb' ? bbb : id === 'aaa' ? aaa : null)),
    valoresDoElenco: vi.fn().mockReturnValue([100, 100]),
  };
});

import FichaPersonagem from './page';

describe('Ficha do personagem', () => {
  it('numera o personagem pela mesma ordem global que a página de elenco usa', async () => {
    const jsx = await FichaPersonagem({ params: Promise.resolve({ id: 'bbb' }) });
    render(jsx);
    // "bbb" é o segundo no array mockado (índice 1) → Student ID #002.
    expect(screen.getByText('[ STUDENT ID: #002 ]')).toBeInTheDocument();
  });

  it('troca o título da seção comparativa pelo texto do HUD', async () => {
    const jsx = await FichaPersonagem({ params: Promise.resolve({ id: 'bbb' }) });
    render(jsx);
    expect(screen.getByText('— // ANÁLISE DE DADOS DO ALUNO // —')).toBeInTheDocument();
  });
});
