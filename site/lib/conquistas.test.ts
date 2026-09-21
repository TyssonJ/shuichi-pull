import { describe, it, expect } from 'vitest';
import { validarConquista, validarIconeDeConquista, validarMotivo, CONQUISTA_LONGA_MAX } from './conquistas';
import { MIDIA_HOST } from './midia-host';

const ok = { nome: 'Detetive Nato', descricaoCurta: 'Resolveu 5 casos', descricaoLonga: 'Ficou com o culpado em 5 partidas.', iconeUrl: 'https://i.imgur.com/a.png' };

describe('validarConquista', () => {
  it('aceita e normaliza', () => {
    const r = validarConquista({ ...ok, nome: '  Detetive   Nato ', descricaoCurta: '  Resolveu\n 5 casos ' });
    expect(r).toEqual({ ok: true, valor: { ...ok, nome: 'Detetive Nato', descricaoCurta: 'Resolveu 5 casos' } });
  });

  it('a descrição completa é opcional', () => {
    expect(validarConquista({ ...ok, descricaoLonga: '' }).ok).toBe(true);
  });

  it('descrição curta obrigatória e com teto; completa com teto', () => {
    expect(validarConquista({ ...ok, descricaoCurta: '  ' }).ok).toBe(false);
    expect(validarConquista({ ...ok, descricaoCurta: 'a'.repeat(91) }).ok).toBe(false);
    expect(validarConquista({ ...ok, descricaoLonga: 'a'.repeat(CONQUISTA_LONGA_MAX + 1) }).ok).toBe(false);
  });

  it('nome com tamanho e sem invisíveis', () => {
    expect(validarConquista({ ...ok, nome: 'a' }).ok).toBe(false);
    expect(validarConquista({ ...ok, nome: 'a'.repeat(41) }).ok).toBe(false);
    expect(validarConquista({ ...ok, nome: 'ab' + String.fromCharCode(0x202e) + 'cd' }).ok).toBe(false);
  });

  it('o ícone é validado junto', () => {
    const r = validarConquista({ ...ok, iconeUrl: 'https://evil.example/a.png' });
    expect(!r.ok && r.erro).toContain('ícone');
  });
});

describe('validarIconeDeConquista', () => {
  it('aceita o nosso Blob e hospedagens permitidas; recusa o resto', () => {
    expect(validarIconeDeConquista(`https://${MIDIA_HOST}/icone/a.png`).ok).toBe(true);
    expect(validarIconeDeConquista('https://i.imgur.com/a.png').ok).toBe(true);
    expect(validarIconeDeConquista('https://evil.example/a.png').ok).toBe(false);
    expect(validarIconeDeConquista('http://i.imgur.com/a.png').ok).toBe(false);
  });
});

describe('validarMotivo', () => {
  it('vazio vira null; texto é aparado; teto de tamanho', () => {
    expect(validarMotivo('  ')).toEqual({ ok: true, valor: null });
    expect(validarMotivo(undefined)).toEqual({ ok: true, valor: null });
    expect(validarMotivo(' venceu o torneio ')).toEqual({ ok: true, valor: 'venceu o torneio' });
    expect(validarMotivo('a'.repeat(201)).ok).toBe(false);
  });
});
