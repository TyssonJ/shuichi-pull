import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/lib/junko/servico', () => ({ lerUrlDoBot: vi.fn() }));
vi.mock('@/db/repositorios/usuarios', () => ({ repositorioUsuarios: { existentes: vi.fn() } }));
vi.mock('@/lib/junko/estatisticas-bot', async (importarOriginal) => ({
  ...(await importarOriginal<typeof import('@/lib/junko/estatisticas-bot')>()),
  buscarRankingDoBot: vi.fn(),
}));

import { lerUrlDoBot } from '@/lib/junko/servico';
import { repositorioUsuarios } from '@/db/repositorios/usuarios';
import { buscarRankingDoBot } from '@/lib/junko/estatisticas-bot';
import PaginaRanking from './page';

const item = (discordId: string, nome: string, valor: number) => ({ posicao: 1, discordId, nome, valor, partidas: null });

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(lerUrlDoBot).mockResolvedValue('https://bot.example');
  vi.mocked(repositorioUsuarios.existentes).mockResolvedValue(new Set(['111']));
});

describe('/ranking', () => {
  it('mostra os três placares com o valor de cada categoria e linka quem tem conta', async () => {
    vi.mocked(buscarRankingDoBot).mockImplementation(async (_url, categoria) => ({
      ok: true, dados: { categoria, itens: [item('111', `Top-${categoria}`, 7)] },
    }));
    render(await PaginaRanking());

    expect(screen.getByRole('heading', { name: 'RANKING' })).toBeInTheDocument();
    for (const titulo of ['RIQUEZA', 'VITÓRIAS', 'MVPS']) expect(screen.getByLabelText(titulo)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Top-riqueza' }).getAttribute('href')).toMatch(/^\/u\/111\/?$/);
    // um só round-trip ao banco, com os ids sem repetir
    expect(repositorioUsuarios.existentes).toHaveBeenCalledOnce();
    expect(vi.mocked(repositorioUsuarios.existentes).mock.calls[0][0]).toEqual(['111']);
  });

  it('bot fora do ar: a página abre e cada placar avisa, sem erro 500', async () => {
    vi.mocked(buscarRankingDoBot).mockResolvedValue({ ok: false, motivo: 'indisponivel' });
    render(await PaginaRanking());
    expect(screen.getAllByText(/não respondeu agora/)).toHaveLength(3);
  });

  it('um placar pode falhar sem derrubar os outros', async () => {
    vi.mocked(buscarRankingDoBot).mockImplementation(async (_u, categoria) =>
      categoria === 'vitorias' ? { ok: false, motivo: 'indisponivel' } : { ok: true, dados: { categoria, itens: [item('999', 'Fulano', 3)] } });
    render(await PaginaRanking());
    expect(screen.getAllByText(/não respondeu agora/)).toHaveLength(1);
    expect(screen.getAllByText('Fulano')).toHaveLength(2);
  });
});
