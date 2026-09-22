import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BotaoModoLeve, BotaoModoLeveCompacto } from './BotaoModoLeve';
import { CamadaAmbiente } from '@/components/ambiente/CamadaAmbiente';
import { Boot } from '@/components/alter-ego/Boot';
import { useMovimentoReduzido } from '@/lib/motion';
import { CHAVE_MODO_LEVE, SCRIPT_MODO_LEVE } from '@/lib/modo-leve';

vi.mock('@/components/alter-ego/JanelaEgo', () => ({ JanelaEgo: () => <div data-testid="janela-ego" /> }));

const leveNoHtml = () => document.documentElement.getAttribute('data-leve') === '1';

function definirVisibilidade(estado: 'visible' | 'hidden') {
  Object.defineProperty(document, 'visibilityState', { get: () => estado, configurable: true });
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-leve');
  definirVisibilidade('visible');
  window.matchMedia = ((q: string) => ({
    matches: false, media: q, onchange: null, addListener: () => {}, removeListener: () => {},
    addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => false,
  })) as typeof window.matchMedia;
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  Reflect.deleteProperty(document, 'visibilityState');
  document.documentElement.removeAttribute('data-leve');
});

describe('botões do modo leve', () => {
  it('o ícone do cabeçalho liga e desliga: atributo no <html>, escolha guardada e estado no botão', () => {
    render(<BotaoModoLeveCompacto />);
    const botao = screen.getByRole('button', { name: 'Modo leve' });
    expect(botao).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(botao);
    expect(leveNoHtml()).toBe(true);
    expect(localStorage.getItem(CHAVE_MODO_LEVE)).toBe('1');
    expect(botao).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(botao);
    expect(leveNoHtml()).toBe(false);
    expect(localStorage.getItem(CHAVE_MODO_LEVE)).toBe('0');
    expect(botao).toHaveAttribute('aria-pressed', 'false');
  });

  it('os botões com texto (menu do celular e rodapé) ficam sincronizados entre si', () => {
    render(<><BotaoModoLeve /><BotaoModoLeveCompacto /><BotaoModoLeve /></>);
    const [menu, , rodape] = [screen.getAllByText(/MODO LEVE: DESLIGADO/)[0], null, screen.getAllByText(/MODO LEVE: DESLIGADO/)[1]];
    fireEvent.click(menu);
    expect(screen.getAllByText('⚡ MODO LEVE: LIGADO')).toHaveLength(2);
    expect(rodape).toHaveTextContent('LIGADO');
    expect(screen.getByRole('button', { name: 'Modo leve' })).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('efeitos do modo leve nos componentes', () => {
  it('a camada de ambiente existe normalmente e SOME no modo leve', () => {
    const { container, unmount } = render(<CamadaAmbiente />);
    expect(container.querySelector('[data-ambiente]')).not.toBeNull();
    expect(container.querySelectorAll('[data-testid="particula"]').length).toBeGreaterThan(0);
    unmount();

    document.documentElement.setAttribute('data-leve', '1');
    const leve = render(<CamadaAmbiente />);
    expect(leve.container).toBeEmptyDOMElement();
  });

  it('as partículas são CSS puro (sem estilo por quadro do framer-motion)', () => {
    const { container } = render(<CamadaAmbiente />);
    const particula = container.querySelector('[data-testid="particula"]') as HTMLElement;
    expect(particula.className).toContain('particula-flutuante');
    expect(particula.style.getPropertyValue('--duracao')).toMatch(/^\d+s$/);
  });

  it('a abertura (Boot) não aparece no modo leve, mesmo na primeira visita', () => {
    document.documentElement.setAttribute('data-leve', '1');
    render(<Boot />);
    expect(screen.queryByTestId('boot')).toBeNull();
  });

  it('sem modo leve, a primeira visita ainda vê a abertura', () => {
    render(<Boot />);
    expect(screen.getByTestId('boot')).toBeInTheDocument();
  });

  it('useMovimentoReduzido passa a valer true quando o modo leve liga', () => {
    function Sonda() {
      return <p data-testid="sonda">{String(useMovimentoReduzido())}</p>;
    }
    render(<><Sonda /><BotaoModoLeveCompacto /></>);
    expect(screen.getByTestId('sonda')).toHaveTextContent('false');
    fireEvent.click(screen.getByRole('button', { name: 'Modo leve' }));
    expect(screen.getByTestId('sonda')).toHaveTextContent('true');
  });
});

describe('layout raiz', () => {
  it('põe o script do modo leve no <head>, antes de qualquer conteúdo (evita o "pisca")', async () => {
    vi.doMock('@/components/alter-ego/BarraEgo', () => ({ BarraEgo: () => null }));
    vi.doMock('@/components/layout/Rodape', () => ({ Rodape: () => null }));
    vi.doMock('@/components/ambiente/CamadaAmbiente', () => ({ CamadaAmbiente: () => null }));
    vi.doMock('@/components/partidas/AlertaGlobalPartida', () => ({ AlertaGlobalPartida: () => null }));
    vi.doMock('@/components/chat/ChatFlutuante', () => ({ ChatFlutuante: () => null }));
    vi.doMock('@/components/layout/SugestaoModoLeve', () => ({ SugestaoModoLeve: () => null }));
    vi.resetModules();
    const { default: RootLayout } = await import('@/app/layout');
    const html = renderToStaticMarkup(RootLayout({ children: <p>conteúdo</p> }));

    const posScript = html.indexOf('<script>');
    expect(html).toContain('<head>');
    expect(posScript).toBeGreaterThan(html.indexOf('<head>'));
    expect(posScript).toBeLessThan(html.indexOf('</head>'));
    expect(posScript).toBeLessThan(html.indexOf('<body'));
    // O script vai cru (sem escapar) e é o mesmo que o teste de paridade confere contra a regra em TypeScript.
    expect(html).toContain(SCRIPT_MODO_LEVE);
  });
});
