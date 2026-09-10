import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const usePathnameMock = vi.fn(() => '/');
vi.mock('next/navigation', () => ({
  usePathname: () => usePathnameMock(),
}));

import { useLogAlterEgo, __resetarLogAlterEgoParaTeste } from './useLogAlterEgo';

describe('useLogAlterEgo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    usePathnameMock.mockReturnValue('/');
    __resetarLogAlterEgoParaTeste();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('mostra uma fala de boot ao montar', () => {
    const { result } = renderHook(() => useLogAlterEgo());
    expect(['SYS_BOOT', 'CORE_INIT', 'WELCOME', 'SEC_CHECK']).toContain(result.current.tag);
  });

  it('troca pra fala da seção quando o pathname muda pra uma rota conhecida', () => {
    usePathnameMock.mockReturnValue('/');
    const { result, rerender } = renderHook(() => useLogAlterEgo());

    usePathnameMock.mockReturnValue('/elenco/');
    rerender();

    expect(result.current.tag).toBe('ELENCO_LOG');
  });

  it('troca sozinho depois do intervalo ocioso (30-45s)', () => {
    const { result } = renderHook(() => useLogAlterEgo());
    const falaInicial = result.current.tag;

    act(() => {
      vi.advanceTimersByTime(45_000);
    });

    expect(result.current.tag).not.toBe(falaInicial);
  });

  it('não troca antes dos 30s mínimos', () => {
    const { result } = renderHook(() => useLogAlterEgo());
    const falaInicial = result.current.tag;

    act(() => {
      vi.advanceTimersByTime(29_000);
    });

    expect(result.current.tag).toBe(falaInicial);
  });

  it('forcarNovaLinha troca a fala imediatamente, sem esperar o rodízio', () => {
    const { result } = renderHook(() => useLogAlterEgo());
    const falaInicial = result.current.tag;

    act(() => {
      result.current.forcarNovaLinha();
    });

    expect(result.current.tag).not.toBe(falaInicial);
  });

  it('duas instâncias simultâneas (cabeçalho + trilha) mostram a mesma fala o tempo todo', () => {
    const a = renderHook(() => useLogAlterEgo());
    const b = renderHook(() => useLogAlterEgo());

    expect(a.result.current.tag).toBe(b.result.current.tag);
    expect(a.result.current.texto).toBe(b.result.current.texto);

    act(() => {
      a.result.current.forcarNovaLinha();
    });

    expect(a.result.current.tag).toBe(b.result.current.tag);
  });

  it('duas instâncias simultâneas trocam de fala juntas no rodízio ocioso (um só temporizador)', () => {
    const a = renderHook(() => useLogAlterEgo());
    const b = renderHook(() => useLogAlterEgo());
    const falaInicial = a.result.current.tag;

    act(() => {
      vi.advanceTimersByTime(45_000);
    });

    expect(a.result.current.tag).not.toBe(falaInicial);
    expect(a.result.current.tag).toBe(b.result.current.tag);
  });
});
