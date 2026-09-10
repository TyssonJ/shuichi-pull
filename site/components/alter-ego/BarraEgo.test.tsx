import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { falasDaSecao } from '@/lib/alter-ego';
import { usePathname } from 'next/navigation';
import { BarraEgo } from './BarraEgo';

// Mock dinâmico: a maioria dos testes não liga pra rota exata, mas o bloco
// de "destaque de seção atual" precisa forçar /elenco/ especificamente.
vi.mock('next/navigation', () => ({ usePathname: vi.fn(() => '/itens/') }));

describe('BarraEgo', () => {
  beforeEach(() => localStorage.clear());

  it('mostra a busca e os links de seção', () => {
    render(<BarraEgo />);
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /elenco/i })).toBeInTheDocument();
  });

  it('lista resultados ao digitar', () => {
    render(<BarraEgo />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'chihiro' } });
    expect(screen.getByText('Chihiro Fujisaki')).toBeInTheDocument();
  });

  it('avisa quando não acha nada', () => {
    render(<BarraEgo />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'zzzzzzz' } });
    expect(screen.getByText(/não achei nada/i)).toBeInTheDocument();
  });

  it('lembra que a janela flutuante ficou aberta', () => {
    localStorage.setItem('ego-flutuante-aberta', 'true');
    render(<BarraEgo />);
    expect(screen.getByTestId('ego-flutuante')).toBeInTheDocument();
  });

  it('guarda o fechamento da janela flutuante', () => {
    localStorage.setItem('ego-flutuante-aberta', 'true');
    render(<BarraEgo />);
    fireEvent.click(screen.getByRole('button', { name: /fechar a janela/i }));
    expect(localStorage.getItem('ego-flutuante-aberta')).toBe('false');
  });
});

// jsdom não traz IntersectionObserver. Este espião guarda o callback para o
// teste poder simular a rolagem que tira o topo da tela.
function espiarObservador() {
  let disparar: (visivel: boolean) => void = () => {};
  class Falso {
    constructor(cb: (e: { isIntersecting: boolean }[]) => void) {
      disparar = (visivel) => cb([{ isIntersecting: visivel }]);
    }
    observe() {}
    disconnect() {}
  }
  vi.stubGlobal('IntersectionObserver', Falso);
  return { rolar: () => act(() => disparar(false)), voltarAoTopo: () => act(() => disparar(true)) };
}

describe('BarraEgo ao rolar a página', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.unstubAllGlobals());

  it('esconde o cabeçalho quando o topo sai de cena', () => {
    const obs = espiarObservador();
    render(<BarraEgo />);
    expect(screen.getByRole('banner')).not.toHaveAttribute('inert');
    obs.rolar();
    expect(screen.getByRole('banner')).toHaveAttribute('inert');
  });

  it('traz o cabeçalho de volta ao subir', () => {
    const obs = espiarObservador();
    render(<BarraEgo />);
    obs.rolar();
    obs.voltarAoTopo();
    expect(screen.getByRole('banner')).not.toHaveAttribute('inert');
  });

  it('mostra a bolinha com carinha, não com o sprite do Chihiro', () => {
    const obs = espiarObservador();
    render(<BarraEgo />);
    obs.rolar();
    const bolinha = screen.getByTestId('ego-bolinha');
    expect(bolinha.querySelector('img')).toBeNull();
    expect(bolinha.textContent?.trim()).not.toBe('');
  });
});

describe('BarraEgo: o Alter Ego fala e treme', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.unstubAllGlobals());

  it('treme ao chegar numa seção com algo a dizer', () => {
    const obs = espiarObservador();
    render(<BarraEgo />);
    obs.rolar();
    expect(screen.getByTestId('ego-bolinha')).toHaveAttribute('data-tremendo', 'sim');
  });

  it('para de tremer depois que a janelinha é aberta', () => {
    const obs = espiarObservador();
    render(<BarraEgo />);
    obs.rolar();
    fireEvent.click(screen.getByTestId('ego-bolinha'));
    fireEvent.click(screen.getByRole('button', { name: /fechar a janela/i }));
    expect(screen.getByTestId('ego-bolinha')).toHaveAttribute('data-tremendo', 'nao');
  });

  it('mostra na janelinha uma fala da seção em que a pessoa está', () => {
    localStorage.setItem('ego-flutuante-aberta', 'true');
    render(<BarraEgo />);
    const dito = screen.getByTestId('ego-flutuante').textContent ?? '';
    expect(falasDaSecao('itens').some((f) => dito.includes(f))).toBe(true);
  });
});

describe('BarraEgo — numeração e retícula', () => {
  beforeEach(() => localStorage.clear());

  it('numera os links de seção', () => {
    render(<BarraEgo />);
    expect(screen.getByRole('link', { name: /01\s*\/\/\s*ELENCO/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /02\s*\/\/\s*ITENS/i })).toBeInTheDocument();
  });

  it('cada link de seção tem uma retícula decorativa escondida do leitor de tela', () => {
    render(<BarraEgo />);
    const link = screen.getByRole('link', { name: /01\s*\/\/\s*ELENCO/i });
    expect(link.querySelector('[data-testid="reticula"]')).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('BarraEgo — atalho Ctrl+K', () => {
  beforeEach(() => localStorage.clear());

  it('Ctrl+K foca a busca do cabeçalho quando ela está visível', () => {
    render(<BarraEgo />);
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(document.getElementById('busca-header')).toHaveFocus();
  });

  it('Ctrl+K abre a janela flutuante e foca a busca dela quando o cabeçalho está escondido', async () => {
    // Simula "já rolou a página": a barra visível some quando o
    // IntersectionObserver do topo reporta isIntersecting: false. Os
    // testes existentes de scroll já mockam isso — replicando o mesmo
    // espião aqui.
    class ObservadorFalso {
      constructor(cb: (e: { isIntersecting: boolean }[]) => void) {
        setTimeout(() => cb([{ isIntersecting: false }]), 0);
      }
      observe() {}
      disconnect() {}
    }
    vi.stubGlobal('IntersectionObserver', ObservadorFalso);

    render(<BarraEgo />);
    // Espera o efeito real do IntersectionObserver (barraVisivel === false)
    // aparecer no DOM — o botão flutuante só existe quando a barra some —
    // em vez de um delay fixo, que é sensível à carga da máquina.
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /abrir a janela do alter ego/i })).toBeInTheDocument(),
    );
    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    // O foco agora acontece dentro de um useEffect (não mais um
    // requestAnimationFrame) — sem corrida de timer real pra esperar, mas
    // o waitFor continua aqui como rede de segurança.
    await waitFor(() => expect(document.getElementById('busca-flutuante')).toHaveFocus());
    vi.unstubAllGlobals();
  });

  it('previne o comportamento padrão do navegador para Ctrl+K', () => {
    render(<BarraEgo />);
    const evento = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, cancelable: true });
    window.dispatchEvent(evento);
    expect(evento.defaultPrevented).toBe(true);
  });
});

describe('BarraEgo — Terminal OS', () => {
  beforeEach(() => localStorage.clear());

  it('mostra o indicador de núcleo online', () => {
    render(<BarraEgo />);
    expect(screen.getByText('CORE: ONLINE')).toBeInTheDocument();
  });

  it('o campo de busca troca de placeholder quando ganha foco', () => {
    render(<BarraEgo />);
    const campo = screen.getAllByRole('searchbox')[0];
    expect(campo).toHaveAttribute('placeholder', 'buscar item, local, personagem…');
    fireEvent.focus(campo);
    expect(campo).toHaveAttribute('placeholder', 'digite pra consultar os registros…');
    fireEvent.blur(campo);
    expect(campo).toHaveAttribute('placeholder', 'buscar item, local, personagem…');
  });

  it('mostra a linha de log do Alter Ego quando o campo não está em foco', () => {
    render(<BarraEgo />);
    expect(screen.getByTestId('log-alterego')).toBeInTheDocument();
  });

  it('esconde a linha de log enquanto o campo de busca está em foco', () => {
    render(<BarraEgo />);
    const campo = screen.getAllByRole('searchbox')[0];
    fireEvent.focus(campo);
    expect(screen.queryByTestId('log-alterego')).not.toBeInTheDocument();
  });
});

describe('BarraEgo — destaque de seção atual', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(usePathname).mockReturnValue('/elenco/');
  });
  afterEach(() => {
    vi.mocked(usePathname).mockReturnValue('/itens/');
  });

  it('marca a seção da página atual com aria-current e destaque visual', () => {
    render(<BarraEgo />);
    const linkAtual = screen.getByRole('link', { name: /01\s*\/\/\s*ELENCO/i });
    const linkOutro = screen.getByRole('link', { name: /02\s*\/\/\s*ITENS/i });
    expect(linkAtual).toHaveAttribute('aria-current', 'page');
    expect(linkAtual.className).toMatch(/execution-pink/);
    expect(linkOutro).not.toHaveAttribute('aria-current');
  });

  it('não recorta a retícula decorativa com overflow-hidden', () => {
    render(<BarraEgo />);
    const link = screen.getByRole('link', { name: /01\s*\/\/\s*ELENCO/i });
    expect(link.className).not.toMatch(/overflow-hidden/);
  });

  it('a fala do log usa a cor "dim" do tema (contraste AA), não uma cor customizada mais escura', () => {
    render(<BarraEgo />);
    const linha = screen.getByTestId('log-alterego');
    const falaSpan = linha.querySelector('span:last-child');
    expect(falaSpan).toHaveClass('text-dim');
  });
});
