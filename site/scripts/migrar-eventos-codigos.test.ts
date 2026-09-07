import { describe, it, expect } from 'vitest';
import { mapearEvento, mapearCodigo } from './migrar-eventos-codigos';
import type { Evento, Codigo } from '@/lib/eventos';

describe('mapearEvento', () => {
  it('converte um evento do JSON para o formato da tabela', () => {
    const evento: Evento = {
      id: 'shuichi-pull-no-ar',
      tipo: 'noticia',
      titulo: 'O site foi ao ar',
      data: '2026-09-01',
      ate: null,
      destaque: true,
      autor: 'admin',
      resumo: 'resumo curto',
      corpo: 'corpo completo',
    };

    expect(mapearEvento(evento)).toEqual({
      id: 'shuichi-pull-no-ar',
      tipo: 'noticia',
      titulo: 'O site foi ao ar',
      data: '2026-09-01',
      ate: null,
      destaque: true,
      autor: 'admin',
      resumo: 'resumo curto',
      corpo: 'corpo completo',
    });
  });
});

describe('mapearCodigo', () => {
  it('converte um código do JSON para o formato da tabela', () => {
    const codigo: Codigo = {
      codigo: 'BEMVINDO2026',
      recompensa: '500 moedas',
      descricao: 'código de lançamento',
      expiraEm: '2026-12-31',
      fonte: 'https://discord.gg/exemplo',
    };

    expect(mapearCodigo(codigo)).toEqual({
      codigo: 'BEMVINDO2026',
      recompensa: '500 moedas',
      descricao: 'código de lançamento',
      expiraEm: '2026-12-31',
      fonte: 'https://discord.gg/exemplo',
    });
  });
});
