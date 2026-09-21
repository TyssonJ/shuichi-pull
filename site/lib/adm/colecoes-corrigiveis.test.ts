import { describe, it, expect } from 'vitest';
import { CAMPOS_POR_COLECAO, registrosBase } from './colecoes-corrigiveis';

describe('CAMPOS_POR_COLECAO', () => {
  it('define os campos corrigíveis de personagens', () => {
    const caminhos = CAMPOS_POR_COLECAO.personagens.map((c) => c.caminho);
    expect(caminhos).toEqual([
      'nome', 'talento.pt', 'talento.en', 'descricao.pt', 'descricao.en', 'jogo', 'sprite',
      'personalidade', 'aparencia', 'historia', 'segredo',
    ]);
  });

  it('história e segredo do personagem são editáveis em texto longo', () => {
    const longos = CAMPOS_POR_COLECAO.personagens.filter((c) => c.longo).map((c) => c.caminho);
    expect(longos).toEqual(expect.arrayContaining(['historia', 'segredo', 'personalidade', 'aparencia']));
  });

  it('não inclui campos numéricos de personagens', () => {
    const caminhos = CAMPOS_POR_COLECAO.personagens.map((c) => c.caminho);
    expect(caminhos).not.toContain('velocidade');
    expect(caminhos).not.toContain('mochila');
    expect(caminhos).not.toContain('percepcao');
    expect(caminhos).not.toContain('vida');
  });

  it('define os campos corrigíveis de itens, sem campos de jogo', () => {
    const caminhos = CAMPOS_POR_COLECAO.itens.map((c) => c.caminho);
    expect(caminhos).toContain('nome.pt');
    expect(caminhos).toContain('descricao.pt');
    expect(caminhos).not.toContain('peso');
    expect(caminhos).not.toContain('nivelRaridade');
  });

  it('define os campos corrigíveis de locais', () => {
    expect(CAMPOS_POR_COLECAO.locais.map((c) => c.caminho)).toEqual(['nome.pt', 'nome.en']);
  });

  it('define os campos corrigíveis de faq', () => {
    expect(CAMPOS_POR_COLECAO.faq.map((c) => c.caminho)).toEqual(['pergunta', 'resposta']);
  });

  it('define os campos corrigíveis de controles', () => {
    expect(CAMPOS_POR_COLECAO.controles.map((c) => c.caminho)).toEqual(['titulo', 'texto']);
  });
});

describe('registrosBase', () => {
  it('lista os personagens base', () => {
    expect(registrosBase('personagens').length).toBeGreaterThan(0);
  });

  it('lista os itens base', () => {
    expect(registrosBase('itens').length).toBeGreaterThan(0);
  });

  it('lista os locais base', () => {
    expect(registrosBase('locais').length).toBeGreaterThan(0);
  });

  it('lista o faq base', () => {
    expect(registrosBase('faq').length).toBeGreaterThan(0);
  });

  it('lista os cards de mecânica base', () => {
    expect(registrosBase('controles').length).toBeGreaterThan(0);
  });
});
