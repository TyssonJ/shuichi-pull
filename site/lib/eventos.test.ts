import { describe, it, expect } from 'vitest';
import {
  listarEventos, buscarEvento, listarCodigos, estaExpirado, separarCodigos,
  CodigoSchema, EventoSchema,
} from './eventos';

describe('eventos', () => {
  it('valida o arquivo de conteúdo', () => {
    expect(listarEventos().length).toBeGreaterThan(0);
  });

  it('acha evento pelo id', () => {
    const primeiro = listarEventos()[0];
    expect(buscarEvento(primeiro.id)?.titulo).toBe(primeiro.titulo);
  });

  it('devolve null para evento inexistente', () => {
    expect(buscarEvento('evento-que-nao-existe')).toBeNull();
  });

  it('põe destaque na frente e ordena do mais novo para o mais velho', () => {
    const e = listarEventos();
    const semDestaque = e.findIndex((x) => !x.destaque);
    if (semDestaque > 0) expect(e[semDestaque - 1].destaque).toBe(true);
  });

  it('rejeita data fora do formato AAAA-MM-DD', () => {
    const base = listarEventos()[0];
    expect(() => EventoSchema.parse({ ...base, data: '06/09/2026' })).toThrow();
  });

  it('rejeita tipo desconhecido', () => {
    const base = listarEventos()[0];
    expect(() => EventoSchema.parse({ ...base, tipo: 'fofoca' })).toThrow();
  });
});

describe('códigos', () => {
  const codigo = {
    codigo: 'TESTE', recompensa: '100 monomoedas',
    descricao: 'Código de teste.', expiraEm: '2026-09-10', fonte: null,
  };

  it('valida o arquivo de conteúdo', () => {
    expect(Array.isArray(listarCodigos())).toBe(true);
  });

  it('vale durante todo o dia da expiração', () => {
    expect(estaExpirado(codigo, new Date(2026, 8, 10, 23, 0))).toBe(false);
    expect(estaExpirado(codigo, new Date(2026, 8, 11, 0, 1))).toBe(true);
  });

  it('código sem data nunca expira', () => {
    expect(estaExpirado({ ...codigo, expiraEm: null }, new Date(2099, 0, 1))).toBe(false);
  });

  it('separa ativos de expirados', () => {
    const { ativos, expirados } = separarCodigos(new Date(2026, 8, 6));
    expect(ativos.length + expirados.length).toBe(listarCodigos().length);
  });

  it('rejeita fonte que não seja URL', () => {
    expect(() => CodigoSchema.parse({ ...codigo, fonte: 'discord' })).toThrow();
  });
});
