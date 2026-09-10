import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/lib/dados', () => ({
  listarPersonagens: vi.fn().mockReturnValue(
    Array.from({ length: 56 }, (_, i) => ({ id: `p${i}` }))
  ),
}));
vi.mock('@/lib/sprites', () => ({ spriteDoPersonagem: () => '/sprites/shuichi.webp' }));

import Inicio from './page';

describe('Página inicial', () => {
  it('mostra o título com a palavra em destaque', async () => {
    render(await Inicio());
    expect(screen.getByRole('heading', { name: /shinri\s*trial/i })).toBeInTheDocument();
  });

  it('mostra o subtítulo abaixo do título', async () => {
    render(await Inicio());
    expect(screen.getByText('O caso está aberto.')).toBeInTheDocument();
  });

  it('mostra as três faixas numeradas com os totais certos', async () => {
    render(await Inicio());
    expect(screen.getByRole('link', { name: /elenco/i })).toBeInTheDocument();
    expect(screen.getByText(/56 alunos/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^02 itens/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /mapa/i })).toBeInTheDocument();
  });

  it('o botão de começar tem o feedback tátil de clique', async () => {
    render(await Inicio());
    const cta = screen.getByRole('link', { name: /nunca joguei/i });
    expect(cta.className).toMatch(/active:translate-x-1/);
  });
});
