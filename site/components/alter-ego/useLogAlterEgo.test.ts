import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const usePathnameMock = vi.fn(() => '/');
vi.mock('next/navigation', () => ({
  usePathname: () => usePathnameMock(),
}));

import { useLogAlterEgo } from './useLogAlterEgo';

describe('useLogAlterEgo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    usePathnameMock.mockReturnValue('/');
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
});
