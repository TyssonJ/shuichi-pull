import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/lib/junko/servico', () => ({ lerUrlDoBot: vi.fn() }));
vi.mock('@/lib/junko/estatisticas-bot', async (importarOriginal) => ({
  ...(await importarOriginal<typeof import('@/lib/junko/estatisticas-bot')>()),
  buscarPerfilDoBot: vi.fn(),
}));

import { lerUrlDoBot } from '@/lib/junko/servico';
import { buscarPerfilDoBot, type PerfilDoBot } from '@/lib/junko/estatisticas-bot';
import { CartaoJunko } from './CartaoJunko';
import { JunkoNoPerfil } from './JunkoNoPerfil';
import { ListaRanking } from '@/components/ranking/ListaRanking';

const perfil: PerfilDoBot = {
  jcoins: 1905, partidas: 9, vitorias: 2, mvps: 1, mains: 'Mikan Tsumiki', titulo: 'Sobrevivente Novato', corTitulo: '#EC417A',
  sequenciaDiaria: 13, ultimoDiarioEm: '2026-09-20T12:00:00.000Z',
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(lerUrlDoBot).mockResolvedValue('https://bot.example');
});

describe('CartaoJunko', () => {
  it('mostra economia, números do bot, título, mains e o link do ranking', () => {
    render(<CartaoJunko perfil={perfil} />);
    expect(screen.getByText('1.905')).toBeInTheDocument(); // milhar em pt-BR
    expect(screen.getByText('JCoins')).toBeInTheDocument();
    expect(screen.getByText('13')).toBeInTheDocument();
    expect(screen.getByText('Sobrevivente Novato')).toBeInTheDocument();
    expect(screen.getByText('Mikan Tsumiki')).toBeInTheDocument();
    expect(screen.getByText(/último resgate diário: 20\/09/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ver o ranking/ }).getAttribute('href')).toMatch(/^\/ranking\/?$/);
  });

  it('a cor do título escolhida no bot é clareada quando some no fundo escuro', () => {
    render(<CartaoJunko perfil={{ ...perfil, corTitulo: '#101020' }} />);
    const cor = screen.getByText('Sobrevivente Novato').style.color;
    expect(cor).not.toBe('rgb(16, 16, 32)');
  });

  it('sem título, sem mains e sem resgate: só os números', () => {
    render(<CartaoJunko perfil={{ ...perfil, titulo: null, corTitulo: null, mains: null, ultimoDiarioEm: null }} />);
    expect(screen.queryByText(/mains no bot/)).toBeNull();
    expect(screen.queryByText(/último resgate/)).toBeNull();
    expect(screen.getByText('JCoins')).toBeInTheDocument();
  });
});

describe('JunkoNoPerfil', () => {
  it('mostra o cartão quando o bot conhece a pessoa (usa a URL configurada)', async () => {
    vi.mocked(buscarPerfilDoBot).mockResolvedValue({ ok: true, dados: perfil });
    render(await JunkoNoPerfil({ discordId: '123456' }));
    expect(buscarPerfilDoBot).toHaveBeenCalledWith('https://bot.example', '123456');
    expect(screen.getByLabelText('Junko Bot')).toBeInTheDocument();
  });

  it.each(['nao-encontrado', 'indisponivel', 'resposta-invalida'] as const)('não mostra nada (nem erro) quando o bot diz %s', async (motivo) => {
    vi.mocked(buscarPerfilDoBot).mockResolvedValue({ ok: false, motivo });
    const { container } = render(<>{await JunkoNoPerfil({ discordId: '123456' })}</>);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('ListaRanking', () => {
  const itens = [
    { posicao: 1, discordId: '111', nome: 'Ana', valor: 910, partidas: null },
    { posicao: 2, discordId: '222', nome: 'Bia', valor: 905, partidas: null },
  ];

  it('lista posição, nome e valor; só quem tem conta no site vira link', () => {
    render(<ListaRanking titulo="RIQUEZA" rotuloValor="JCoins" itens={itens} noSite={new Set(['111'])} />);
    expect(screen.getByText('1º')).toBeInTheDocument();
    expect(screen.getByText('910')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ana' }).getAttribute('href')).toMatch(/^\/u\/111\/?$/);
    expect(screen.getByText('Bia').closest('a')).toBeNull();
  });

  it('vazio e bot fora do ar têm avisos diferentes', () => {
    const { unmount } = render(<ListaRanking titulo="X" rotuloValor="v" itens={[]} noSite={new Set()} />);
    expect(screen.getByText('Ninguém no placar ainda.')).toBeInTheDocument();
    unmount();
    render(<ListaRanking titulo="X" rotuloValor="v" itens={[]} noSite={new Set()} indisponivel />);
    expect(screen.getByText(/não respondeu agora/)).toBeInTheDocument();
  });
});
