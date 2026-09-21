import { describe, it, expect } from 'vitest';
import { validarConteudo, gerarIdConteudo, ehColecaoConteudo, CAMPOS_CONTEUDO } from './conteudo';
import { caminhosParaRevalidar, urlPublicaDoRegistro } from './rotas-colecao';

describe('validarConteudo', () => {
  const faq = { secao: 'Regras', pergunta: ' Como jogo? ', resposta: 'Assim.\r\nAssado.' };

  it('apara, normaliza quebra de linha e mantém só os campos da coleção', () => {
    const r = validarConteudo('faq', { ...faq, lixo: 'x' });
    expect(r).toEqual({ ok: true, valor: { secao: 'Regras', pergunta: 'Como jogo?', resposta: 'Assim.\nAssado.' } });
  });

  it('exige todos os campos', () => {
    const r = validarConteudo('faq', { ...faq, resposta: '   ' });
    expect(r).toEqual({ ok: false, erro: 'Preencha o campo "Resposta".' });
  });

  it('limita o tamanho de cada campo', () => {
    const r = validarConteudo('faq', { ...faq, pergunta: 'a'.repeat(201) });
    expect(!r.ok && r.erro).toContain('200');
  });

  it('cards de mecânica usam grupo/título/texto', () => {
    expect(validarConteudo('controles', { grupo: 'G', titulo: 'T', texto: 'X' }).ok).toBe(true);
    expect(validarConteudo('controles', faq).ok).toBe(false);
  });

  it('só faq e controles são coleções de conteúdo', () => {
    expect(ehColecaoConteudo('faq')).toBe(true);
    expect(ehColecaoConteudo('itens')).toBe(false);
    expect(Object.keys(CAMPOS_CONTEUDO)).toEqual(['faq', 'controles']);
  });
});

describe('gerarIdConteudo', () => {
  it('gera slug sem acento', () => {
    expect(gerarIdConteudo('Como funciona o Alter Ego?', new Set())).toBe('como-funciona-o-alter-ego');
  });

  it('desempata com sufixo numérico, contando os escondidos como ocupados', () => {
    const ocupados = new Set(['duvida', 'duvida-2']);
    expect(gerarIdConteudo('Dúvida', ocupados)).toBe('duvida-3');
  });

  it('título só de símbolos ainda gera id', () => {
    expect(gerarIdConteudo('???', new Set())).toBe('novo');
  });

  it('corta títulos enormes sem terminar em hífen', () => {
    const id = gerarIdConteudo('palavra '.repeat(40), new Set());
    expect(id.length).toBeLessThanOrEqual(50);
    expect(id.endsWith('-')).toBe(false);
  });
});

describe('rotas-colecao', () => {
  it('registro com página própria revalida a listagem, o detalhe e o painel', () => {
    expect(caminhosParaRevalidar('personagens', 'x')).toEqual(['/elenco', '/elenco/x', '/adm/personagens']);
  });

  it('faq/mecânicas não têm detalhe', () => {
    expect(caminhosParaRevalidar('faq', 'x')).toEqual(['/faq', '/adm/faq']);
    expect(caminhosParaRevalidar('controles', 'x')).toEqual(['/mecanicas', '/adm/mecanicas']);
  });

  it('url pública leva pro registro (página própria ou âncora)', () => {
    expect(urlPublicaDoRegistro('itens', 'espada')).toBe('/itens/espada/');
    expect(urlPublicaDoRegistro('faq', 'como-jogo')).toBe('/faq/#como-jogo');
  });
});
