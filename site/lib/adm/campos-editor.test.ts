import { describe, it, expect } from 'vitest';
import { camposDoEditor, camposParaMontar } from './campos-editor';

describe('camposDoEditor', () => {
  it('FAQ: seção travada nos do guia, resposta em texto longo', () => {
    const campos = camposDoEditor('faq');
    expect(campos.map((c) => c.chave)).toEqual(['secao', 'pergunta', 'resposta']);
    expect(campos[0].soNovo).toBe(true);
    expect(campos[2].longo).toBe(true);
  });

  it('personagens: história e segredo em texto longo', () => {
    const campos = camposDoEditor('personagens');
    expect(campos.find((c) => c.chave === 'historia')?.longo).toBe(true);
    expect(campos.find((c) => c.chave === 'segredo')?.longo).toBe(true);
  });

  it('itens usam o caminho pontilhado como chave', () => {
    expect(camposDoEditor('itens').map((c) => c.chave)).toContain('descricao.pt');
  });
});

describe('camposParaMontar', () => {
  it('FAQ e mecânicas incluem a seção/grupo pra exibir (não corrigível)', () => {
    expect(camposParaMontar('faq')[0].caminho).toBe('secao');
    expect(camposParaMontar('controles')[0].caminho).toBe('grupo');
  });

  it('as demais coleções usam só os corrigíveis', () => {
    expect(camposParaMontar('locais').map((c) => c.caminho)).toEqual(['nome.pt', 'nome.en']);
  });
});
