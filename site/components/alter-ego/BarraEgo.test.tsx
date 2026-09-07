import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { falasDaSecao } from '@/lib/alter-ego';
import { BarraEgo } from './BarraEgo';

vi.mock('next/navigation', () => ({ usePathname: () => '/itens/' }));

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
