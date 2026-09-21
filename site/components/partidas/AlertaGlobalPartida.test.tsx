import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { AlertaGlobalPartida } from './AlertaGlobalPartida';
import { chaveAvisoFechado } from '@/lib/alerta-partida';

vi.mock('next/navigation', () => ({ usePathname: vi.fn(() => '/elenco/') }));
// O relógio sincronizado tem teste próprio (lib/relogio.test.ts e relogio-sincronizado.test.tsx); aqui o
// relógio é o do aparelho, que estes testes controlam com timers falsos.
vi.mock('@/lib/use-relogio', () => ({ useRelogioPronto: () => true }));
vi.mock('@/lib/relogio-cliente', () => ({ agoraSincronizado: () => Date.now(), garantirSincronia: () => Promise.resolve() }));


function responder(partidas: unknown[]) {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ partidas }), { status: 200 })));
}

const daqui = (min: number) => new Date(Date.now() + min * 60_000).toISOString();

describe('AlertaGlobalPartida', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.mocked(usePathname).mockReturnValue('/elenco/');
  });
  afterEach(() => vi.unstubAllGlobals());

  it('mostra o aviso da partida inscrita, com link pra sala', async () => {
    responder([{ id: 7, titulo: 'Trial de sábado', dataHora: daqui(20), tipo: 'participante' }]);
    render(<AlertaGlobalPartida />);
    const alerta = await screen.findByRole('alert');
    expect(alerta).toHaveTextContent('Trial de sábado');
    expect(screen.getByRole('link', { name: /entrar na sala/i })).toHaveAttribute('href', '/partidas/7/');
    expect(alerta).not.toHaveTextContent('RESERVA');
  });

  it('avisa quando o inscrito é reserva', async () => {
    responder([{ id: 7, titulo: 'X', dataHora: daqui(20), tipo: 'reserva' }]);
    render(<AlertaGlobalPartida />);
    expect(await screen.findByRole('alert')).toHaveTextContent('VOCÊ É RESERVA');
  });

  it('já passou do horário: manda entrar no servidor', async () => {
    responder([{ id: 7, titulo: 'X', dataHora: daqui(-3), tipo: 'participante' }]);
    render(<AlertaGlobalPartida />);
    expect(await screen.findByRole('alert')).toHaveTextContent('JÁ COMEÇOU');
  });

  it('sem partida no horário (ou visitante anônimo) não aparece nada', async () => {
    responder([]);
    render(<AlertaGlobalPartida />);
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('na própria página da partida some (ela já tem o aviso dela)', async () => {
    vi.mocked(usePathname).mockReturnValue('/partidas/7/');
    responder([{ id: 7, titulo: 'X', dataHora: daqui(20), tipo: 'participante' }]);
    render(<AlertaGlobalPartida />);
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('fechar esconde e lembra durante a sessão', async () => {
    responder([{ id: 7, titulo: 'X', dataHora: daqui(20), tipo: 'participante' }]);
    const { unmount } = render(<AlertaGlobalPartida />);
    fireEvent.click(await screen.findByRole('button', { name: /fechar aviso/i }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(sessionStorage.getItem(chaveAvisoFechado(7))).toBe('1');

    unmount();
    render(<AlertaGlobalPartida />);
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('erro de rede não derruba nada', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline'); }));
    render(<AlertaGlobalPartida />);
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
