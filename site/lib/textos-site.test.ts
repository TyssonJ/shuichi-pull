import { describe, it, expect } from 'vitest';
import { TEXTOS_SITE, criarTextos, preencherVariaveis, validarTexto, definicaoDoTexto } from './textos-site';

describe('registro de textos', () => {
  it('chaves únicas e padrões que cabem no limite', () => {
    const chaves = TEXTOS_SITE.map((t) => t.chave);
    expect(new Set(chaves).size).toBe(chaves.length);
    for (const t of TEXTOS_SITE) expect(t.padrao.length).toBeLessThanOrEqual(t.max);
  });

  it('toda variável usada no padrão está declarada', () => {
    for (const t of TEXTOS_SITE) {
      const usadas = [...t.padrao.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
      for (const v of usadas) expect(t.variaveis ?? []).toContain(v);
    }
  });
});

describe('preencherVariaveis', () => {
  it('troca as variáveis conhecidas', () => {
    expect(preencherVariaveis('{total} itens em {locais}', { total: 5, locais: 'x' })).toBe('5 itens em x');
  });

  it('variável desconhecida fica visível', () => {
    expect(preencherVariaveis('oi {nome}', {})).toBe('oi {nome}');
  });
});

describe('criarTextos', () => {
  it('sem valor salvo usa o padrão, já preenchido', () => {
    const t = criarTextos({});
    expect(t('faq.introducao', { total: 12 })).toBe('12 perguntas respondidas, em português.');
  });

  it('valor salvo pelo ADM vence o padrão', () => {
    const t = criarTextos({ 'texto.faq.introducao': 'São {total} respostas.' });
    expect(t('faq.introducao', { total: 3 })).toBe('São 3 respostas.');
  });

  it('valor salvo em branco volta pro padrão', () => {
    const t = criarTextos({ 'texto.home.botao': '   ' });
    expect(t('home.botao')).toBe(definicaoDoTexto('home.botao')!.padrao);
  });

  it('chave desconhecida devolve vazio em vez de quebrar', () => {
    expect(criarTextos({})('nao.existe')).toBe('');
  });
});

describe('validarTexto', () => {
  it('aceita, apara e normaliza', () => {
    expect(validarTexto('home.botao', '  COMEÇAR  ')).toEqual({ ok: true, valor: 'COMEÇAR' });
  });

  it('vazio é válido (volta ao padrão)', () => {
    expect(validarTexto('home.botao', '')).toEqual({ ok: true, valor: '' });
  });

  it('rejeita acima do limite e chave que não existe', () => {
    expect(validarTexto('home.botao', 'a'.repeat(51)).ok).toBe(false);
    expect(validarTexto('segredo.qualquer', 'x')).toEqual({ ok: false, erro: 'Esse texto não é editável.' });
  });
});
