import { describe, it, expect } from 'vitest';
import { executar, ErroDeNegocio } from './acao';
import { desembrulhar, mensagemDeErro } from './acao-cliente';

describe('executar', () => {
  it('sucesso vira {ok:true, dados}', async () => {
    expect(await executar(async () => 42)).toEqual({ ok: true, dados: 42 });
    expect(await executar(async () => {})).toEqual({ ok: true, dados: undefined });
  });

  it('ErroDeNegocio vira {ok:false, erro} em vez de lançar', async () => {
    const r = await executar(async () => { throw new ErroDeNegocio('Dá um título pra partida.'); });
    expect(r).toEqual({ ok: false, erro: 'Dá um título pra partida.' });
  });

  it('erro inesperado continua sendo lançado (o Next esconde o texto dele)', async () => {
    await expect(executar(async () => { throw new Error('connection refused postgres://...'); })).rejects.toThrow('connection refused');
  });
});

describe('desembrulhar', () => {
  it('devolve os dados do sucesso', async () => {
    expect(await desembrulhar(Promise.resolve({ ok: true as const, dados: 7 }))).toBe(7);
  });

  it('lança Error com a mensagem quando a action respondeu {ok:false}', async () => {
    await expect(desembrulhar(Promise.resolve({ ok: false as const, erro: 'vagas acabaram' }))).rejects.toThrow('vagas acabaram');
  });

  it('aceita action que devolve o valor direto (sem envelope)', async () => {
    expect(await desembrulhar(Promise.resolve(undefined))).toBeUndefined();
    expect(await desembrulhar(Promise.resolve('abc'))).toBe('abc');
  });

  it('propaga a rejeição de erro inesperado', async () => {
    await expect(desembrulhar(Promise.reject(new Error('boom')))).rejects.toThrow('boom');
  });
});

describe('mensagemDeErro', () => {
  it('usa a mensagem do erro quando é legível', () => {
    expect(mensagemDeErro(new Error('Data inválida.'), 'padrão')).toBe('Data inválida.');
  });

  it('esconde o texto genérico que o React usa em produção', () => {
    const producao = new Error(
      'An error occurred in the Server Components render. The specific message is omitted in production builds to avoid leaking sensitive details.',
    );
    expect(mensagemDeErro(producao, 'Não deu para salvar.')).toBe('Não deu para salvar.');
  });

  it('valor que não é Error ou mensagem vazia cai no padrão', () => {
    expect(mensagemDeErro('texto', 'padrão')).toBe('padrão');
    expect(mensagemDeErro(new Error(''), 'padrão')).toBe('padrão');
    expect(mensagemDeErro(null, 'padrão')).toBe('padrão');
  });
});
