import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act, cleanup } from '@testing-library/react';
import { Cronometro } from './Cronometro';
import { Contagem } from './Contagem';
import { AlertaInicio } from './AlertaInicio';
import { MonitorDePartidas } from './MonitorDePartidas';
import { HorarioLocal } from './HorarioLocal';
import { reiniciarRelogio } from '@/lib/relogio-cliente';

const refresh = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }));
vi.mock('@/lib/fuso-local', async (importarOriginal) => ({
  ...(await importarOriginal<typeof import('@/lib/fuso-local')>()),
  fusoDoAparelho: vi.fn(() => 'Europe/Lisbon'),
}));

import { fusoDoAparelho } from '@/lib/fuso-local';

beforeEach(() => {
  reiniciarRelogio();
  refresh.mockClear();
  Object.defineProperty(document, 'visibilityState', { get: () => 'visible', configurable: true });
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  Reflect.deleteProperty(document, 'visibilityState');
});

/** Servidor cuja hora está `diferenca` ms à frente do aparelho (a hora dele é a certa). */
function servidorAdiantado(diferenca: number) {
  return vi.fn(async () => ({ ok: true, json: async () => ({ agora: Date.now() + diferenca }) }) as Response);
}

describe('o cronômetro e a contagem usam a hora do SERVIDOR, não a do aparelho', () => {
  it('aparelho com o relógio 2 min ATRASADO: o cronômetro mostra o tempo certo em vez de ficar parado em 00:00:00', async () => {
    vi.stubGlobal('fetch', servidorAdiantado(120_000));
    // o host apertou "Começar" há 65 s (pela hora do servidor)
    const inicio = new Date(Date.now() + 120_000 - 65_000).toISOString();
    render(<Cronometro desdeIso={inicio} />);
    await waitFor(() => expect(screen.getByTestId('cronometro').textContent).toMatch(/^00:01:0[5-9]$/));
  });

  it('aparelho ADIANTADO em 1 min: a contagem até a partida também é a do servidor', async () => {
    vi.stubGlobal('fetch', servidorAdiantado(-60_000));
    const partida = new Date(Date.now() - 60_000 + 600_000).toISOString(); // faltam 10 min pelo servidor
    render(<Contagem dataHora={partida} />);
    await waitFor(() => expect(screen.getByTestId('contagem').textContent).toMatch(/^(10m 0[0-3]s|09m 5[6-9]s)$/));
  });

  it('a contagem espera a medição (traço) em vez de piscar o número errado', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {}))); // servidor que nunca responde
    render(<Contagem dataHora={new Date(Date.now() + 600_000).toISOString()} />);
    expect(screen.getByTestId('contagem')).toHaveTextContent('--');
  });

  it('se o servidor não responde, depois de 1,5 s mostra com o relógio do aparelho (como era antes)', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));
    render(<Cronometro desdeIso={new Date(Date.now() - 65_000).toISOString()} />);
    expect(screen.getByTestId('cronometro')).toHaveTextContent('--:--:--');
    await act(async () => { await vi.advanceTimersByTimeAsync(1600); });
    expect(screen.getByTestId('cronometro').textContent).toMatch(/^00:01:0[5-9]$/);
  });

  it('o aviso "começa em ~N min" também vale pela hora do servidor', async () => {
    vi.stubGlobal('fetch', servidorAdiantado(-10 * 60_000)); // aparelho 10 min adiantado
    const partida = new Date(Date.now() - 10 * 60_000 + 8 * 60_000).toISOString(); // faltam 8 min de verdade
    render(<AlertaInicio dataHora={partida} />);
    expect(await screen.findByText(/COMEÇA EM ~[89] MIN/)).toBeInTheDocument();
  });
});

describe('MonitorDePartidas', () => {
  beforeEach(() => vi.useFakeTimers());

  const estado = (status: string, iniciadaEm: string | null = null) =>
    vi.fn(async () => ({ ok: true, json: async () => ({ estados: { '14': { status, iniciadaEm, finalizadaEm: null } } }) }) as Response);

  it('o host apertou "Começar": a próxima conferência recarrega a página (a contagem vira cronômetro)', async () => {
    const buscar = estado('em_andamento', '2026-09-21T20:00:00.000Z');
    vi.stubGlobal('fetch', buscar);
    render(<MonitorDePartidas partidas={[{ id: 14, status: 'agendada', iniciadaEm: null }]} />);

    await act(async () => { await vi.advanceTimersByTimeAsync(15_000); });
    expect(buscar).toHaveBeenCalledWith('/api/partidas/estado/?ids=14', { cache: 'no-store' });
    expect(refresh).toHaveBeenCalledOnce();
  });

  it('nada mudou: consulta, mas não recarrega', async () => {
    vi.stubGlobal('fetch', estado('agendada'));
    render(<MonitorDePartidas partidas={[{ id: 14, status: 'agendada', iniciadaEm: null }]} />);
    await act(async () => { await vi.advanceTimersByTimeAsync(45_000); });
    expect(refresh).not.toHaveBeenCalled();
  });

  it('partida em andamento que foi finalizada: recarrega pra mostrar a duração e parar o cronômetro', async () => {
    vi.stubGlobal('fetch', estado('finalizada', '2026-09-21T20:00:00.000Z'));
    render(<MonitorDePartidas partidas={[{ id: 14, status: 'em_andamento', iniciadaEm: '2026-09-21T20:00:00.000Z' }]} />);
    await act(async () => { await vi.advanceTimersByTimeAsync(15_000); });
    expect(refresh).toHaveBeenCalledOnce();
  });

  it('partida já encerrada não é vigiada (nenhuma consulta)', async () => {
    const buscar = estado('finalizada');
    vi.stubGlobal('fetch', buscar);
    render(<MonitorDePartidas partidas={[{ id: 14, status: 'finalizada', iniciadaEm: null }, { id: 15, status: 'cancelada', iniciadaEm: null }]} />);
    await act(async () => { await vi.advanceTimersByTimeAsync(60_000); });
    expect(buscar).not.toHaveBeenCalled();
  });

  it('aba oculta não consulta; ao voltar, confere na hora', async () => {
    const buscar = estado('em_andamento', '2026-09-21T20:00:00.000Z');
    vi.stubGlobal('fetch', buscar);
    Object.defineProperty(document, 'visibilityState', { get: () => 'hidden', configurable: true });
    render(<MonitorDePartidas partidas={[{ id: 14, status: 'agendada', iniciadaEm: null }]} />);
    await act(async () => { await vi.advanceTimersByTimeAsync(30_000); });
    expect(buscar).not.toHaveBeenCalled();

    Object.defineProperty(document, 'visibilityState', { get: () => 'visible', configurable: true });
    await act(async () => { document.dispatchEvent(new Event('visibilitychange')); await vi.advanceTimersByTimeAsync(0); });
    expect(buscar).toHaveBeenCalledOnce();
    expect(refresh).toHaveBeenCalledOnce();
  });

  it('sem rede: não quebra e continua tentando; não vira laço apertado (15 s entre consultas)', async () => {
    const buscar = vi.fn().mockRejectedValue(new Error('offline'));
    vi.stubGlobal('fetch', buscar);
    render(<MonitorDePartidas partidas={[{ id: 14, status: 'agendada', iniciadaEm: null }]} />);
    await act(async () => { await vi.advanceTimersByTimeAsync(31_000); });
    expect(buscar).toHaveBeenCalledTimes(2);
    expect(refresh).not.toHaveBeenCalled();
  });
});

describe('HorarioLocal', () => {
  const PARTIDA = '2026-09-21T23:00:00.000Z'; // 20:00 em Brasília

  it('quem está em Portugal também vê o horário do relógio dele', async () => {
    vi.mocked(fusoDoAparelho).mockReturnValue('Europe/Lisbon');
    render(<HorarioLocal iso={PARTIDA} />);
    const el = await screen.findByTestId('horario-local');
    expect(el).toHaveTextContent('no seu horário');
    expect(el).toHaveTextContent('00:00');
    expect(el).toHaveTextContent('Europe/Lisbon');
  });

  it('quem já está no horário de Brasília não vê linha repetida', () => {
    vi.mocked(fusoDoAparelho).mockReturnValue('America/Sao_Paulo');
    render(<HorarioLocal iso={PARTIDA} />);
    expect(screen.queryByTestId('horario-local')).toBeNull();
  });

  it('navegador que não informa o fuso: não mostra nada', () => {
    vi.mocked(fusoDoAparelho).mockReturnValue(null);
    render(<HorarioLocal iso={PARTIDA} />);
    expect(screen.queryByTestId('horario-local')).toBeNull();
  });
});
