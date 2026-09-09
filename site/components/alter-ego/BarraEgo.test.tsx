import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BarraEgo } from './BarraEgo';

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

describe('BarraEgo — numeração e retícula', () => {
  beforeEach(() => localStorage.clear());

  it('numera os links de seção', () => {
    render(<BarraEgo />);
    expect(screen.getByRole('link', { name: /01\.\s*ELENCO/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /02\.\s*ITENS/i })).toBeInTheDocument();
  });

  it('cada link de seção tem uma retícula decorativa escondida do leitor de tela', () => {
    render(<BarraEgo />);
    const link = screen.getByRole('link', { name: /01\.\s*ELENCO/i });
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

    // O handler de produção foca a busca flutuante dentro de um
    // requestAnimationFrame — de propósito, para esperar o próximo render
    // (a janela flutuante só existe no DOM depois que `setFlutuanteAberta`
    // for processado). Sob a suíte completa rodando em paralelo, o rAF
    // real do jsdom pode demorar bem mais que os 16ms usuais pra disparar
    // (contenção pesada de CPU entre os workers) — isso tornava este teste
    // flaky mesmo com um `waitFor` de timeout generoso (confirmado
    // empiricamente: falhou em ~1 a cada 3-5 rodadas da suíte completa).
    //
    // A tentativa óbvia — mockar o rAF pra chamar o callback de forma
    // *síncrona* — na verdade QUEBRA o teste de forma determinística: o
    // callback rodaria antes do React sequer processar a atualização de
    // estado que monta a janela flutuante, então `busca-flutuante` ainda
    // não existiria no DOM nesse instante. O rAF precisa continuar sendo
    // assíncrono — só não precisa depender do timing real (possivelmente
    // lento sob carga) do polyfill de rAF do jsdom. `setTimeout(cb, 0)`
    // preserva o adiamento (roda depois que o React já comitou a
    // atualização) usando um temporizador real de 0ms, sem a variação de
    // timing do rAF real sob contenção pesada.
    const rafOriginal = window.requestAnimationFrame;
    window.requestAnimationFrame = ((cb: FrameRequestCallback) => {
      return setTimeout(() => cb(performance.now()), 0) as unknown as number;
    }) as typeof window.requestAnimationFrame;

    render(<BarraEgo />);
    // Espera o efeito real do IntersectionObserver (barraVisivel === false)
    // aparecer no DOM — o botão flutuante só existe quando a barra some —
    // em vez de um delay fixo, que corre contra o timer mockado acima e é
    // sensível à carga da máquina.
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /abrir a janela do alter ego/i })).toBeInTheDocument(),
    );
    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    await waitFor(() => expect(document.getElementById('busca-flutuante')).toHaveFocus());

    window.requestAnimationFrame = rafOriginal;
    vi.unstubAllGlobals();
  });

  it('previne o comportamento padrão do navegador para Ctrl+K', () => {
    render(<BarraEgo />);
    const evento = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, cancelable: true });
    window.dispatchEvent(evento);
    expect(evento.defaultPrevented).toBe(true);
  });
});
