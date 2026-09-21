import { describe, it, expect, vi, afterEach } from 'vitest';
import { aoFicarOcioso } from './ocioso';

afterEach(() => {
  Reflect.deleteProperty(window, 'requestIdleCallback');
  Reflect.deleteProperty(window, 'cancelIdleCallback');
  vi.useRealTimers();
});

describe('aoFicarOcioso', () => {
  it('sem requestIdleCallback (Safari, testes) roda logo em seguida', async () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    aoFicarOcioso(fn);
    expect(fn).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(0);
    expect(fn).toHaveBeenCalledOnce();
  });

  it('sem requestIdleCallback, cancelar antes impede de rodar', async () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    aoFicarOcioso(fn)();
    await vi.advanceTimersByTimeAsync(10);
    expect(fn).not.toHaveBeenCalled();
  });

  it('com requestIdleCallback usa ele (com o teto de espera) e sabe cancelar', () => {
    const pedir = vi.fn().mockReturnValue(7);
    const cancelar = vi.fn();
    Object.assign(window, { requestIdleCallback: pedir, cancelIdleCallback: cancelar });
    const fn = vi.fn();
    const parar = aoFicarOcioso(fn, 1500);
    expect(pedir).toHaveBeenCalledWith(fn, { timeout: 1500 });
    parar();
    expect(cancelar).toHaveBeenCalledWith(7);
  });
});
