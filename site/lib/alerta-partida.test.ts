import { describe, it, expect } from 'vitest';
import { limitesDoAviso, chaveAvisoFechado, AVISO_ANTES_MIN, AVISO_DEPOIS_MIN } from './alerta-partida';

describe('limitesDoAviso', () => {
  it('vai de 15 minutos atrás até 60 minutos à frente', () => {
    const agora = new Date('2026-09-21T12:00:00Z');
    const { de, ate } = limitesDoAviso(agora);
    expect(de.toISOString()).toBe('2026-09-21T11:45:00.000Z');
    expect(ate.toISOString()).toBe('2026-09-21T13:00:00.000Z');
    expect(AVISO_ANTES_MIN).toBe(60);
    expect(AVISO_DEPOIS_MIN).toBe(15);
  });

  it('não muta a data recebida', () => {
    const agora = new Date('2026-09-21T12:00:00Z');
    limitesDoAviso(agora);
    expect(agora.toISOString()).toBe('2026-09-21T12:00:00.000Z');
  });
});

describe('chaveAvisoFechado', () => {
  it('é uma chave por partida', () => {
    expect(chaveAvisoFechado(7)).not.toBe(chaveAvisoFechado(8));
  });
});
