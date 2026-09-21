import { describe, it, expect } from 'vitest';
import {
  validarEstilo, razaoDeContraste, estiloVazio, estilosIguais, segmentarComEmojis, ESTILO_VAZIO, EMOJIS_MAX,
} from './estilo-perfil';
import { MIDIA_HOST } from './midia-host';

const blob = (nome: string) => `https://${MIDIA_HOST}/imagem/${nome}`;

describe('razaoDeContraste', () => {
  it('preto x branco é 21; cor igual é 1', () => {
    expect(razaoDeContraste('#000000', '#ffffff')).toBeCloseTo(21, 0);
    expect(razaoDeContraste('#00ff66', '#00ff66')).toBeCloseTo(1, 5);
  });
});

describe('validarEstilo — cor de tema', () => {
  it('aceita cor clara o bastante e normaliza', () => {
    expect(validarEstilo({ corTema: ' #FF007F ' })).toMatchObject({ ok: true, valor: { corTema: '#ff007f' } });
  });

  it('recusa formato errado e cor escura demais (sumiria no fundo)', () => {
    expect(validarEstilo({ corTema: 'rosa' }).ok).toBe(false);
    const escura = validarEstilo({ corTema: '#101020' });
    expect(!escura.ok && escura.erro).toContain('escura demais');
  });

  it('sem cor é válido', () => {
    expect(validarEstilo({})).toEqual({ ok: true, valor: ESTILO_VAZIO });
  });
});

describe('validarEstilo — fundos', () => {
  it('aceita imagem do nosso Blob e de host permitido', () => {
    const r = validarEstilo({ fundoEsquerdo: blob('a.png'), fundoDireito: 'https://i.imgur.com/b.png' });
    expect(r).toMatchObject({ ok: true, valor: { fundoEsquerdo: blob('a.png'), fundoDireito: 'https://i.imgur.com/b.png' } });
  });

  it('recusa host não permitido, com o nome de qual fundo', () => {
    const r = validarEstilo({ fundoEsquerdo: 'https://evil.example/x.png' });
    expect(!r.ok && r.erro).toContain('Fundo da esquerda');
  });

  it('a direita sozinha não vale (o esquerdo é o principal)', () => {
    expect(validarEstilo({ fundoDireito: blob('b.png') }).ok).toBe(false);
  });

  it('vazio vira null', () => {
    expect(validarEstilo({ fundoEsquerdo: '  ', fundoDireito: '' })).toMatchObject({ ok: true, valor: { fundoEsquerdo: null, fundoDireito: null } });
  });
});

describe('validarEstilo — emojis', () => {
  it('aceita, tira os dois-pontos e normaliza o código', () => {
    const r = validarEstilo({ emojis: [{ codigo: ':Kappa:', url: blob('k.png') }] });
    expect(r).toMatchObject({ ok: true, valor: { emojis: [{ codigo: 'kappa', url: blob('k.png') }] } });
  });

  it('recusa código inválido, repetido, imagem de host ruim e excesso', () => {
    expect(validarEstilo({ emojis: [{ codigo: 'a', url: blob('k.png') }] }).ok).toBe(false);
    expect(validarEstilo({ emojis: [{ codigo: 'com espaço', url: blob('k.png') }] }).ok).toBe(false);
    expect(validarEstilo({ emojis: [{ codigo: 'oi', url: blob('1.png') }, { codigo: 'oi', url: blob('2.png') }] }).ok).toBe(false);
    expect(validarEstilo({ emojis: [{ codigo: 'oi', url: 'https://evil.example/x.png' }] }).ok).toBe(false);
    const muitos = Array.from({ length: EMOJIS_MAX + 1 }, (_, i) => ({ codigo: `e${i}x`, url: blob(`${i}.png`) }));
    expect(validarEstilo({ emojis: muitos }).ok).toBe(false);
  });
});

describe('estiloVazio / estilosIguais', () => {
  it('detecta estilo sem nada e compara por conteúdo (null = vazio)', () => {
    expect(estiloVazio(ESTILO_VAZIO)).toBe(true);
    expect(estiloVazio({ ...ESTILO_VAZIO, corTema: '#ff007f' })).toBe(false);
    expect(estilosIguais(null, ESTILO_VAZIO)).toBe(true);
    expect(estilosIguais({ ...ESTILO_VAZIO, corTema: '#ff007f' }, ESTILO_VAZIO)).toBe(false);
  });
});

describe('segmentarComEmojis', () => {
  const emojis = [{ codigo: 'kappa', url: 'https://x/k.png' }, { codigo: 'ok_hand', url: 'https://x/o.png' }];

  it('troca só os códigos que a pessoa tem', () => {
    expect(segmentarComEmojis('oi :kappa: tudo :ok_hand:!', emojis)).toEqual([
      { tipo: 'texto', texto: 'oi ' },
      { tipo: 'emoji', codigo: 'kappa', url: 'https://x/k.png' },
      { tipo: 'texto', texto: ' tudo ' },
      { tipo: 'emoji', codigo: 'ok_hand', url: 'https://x/o.png' },
      { tipo: 'texto', texto: '!' },
    ]);
  });

  it('código desconhecido (de outro perfil) continua sendo texto', () => {
    expect(segmentarComEmojis('oi :pepe:', emojis)).toEqual([{ tipo: 'texto', texto: 'oi :pepe:' }]);
  });

  it('sem emojis ou sem código, devolve o texto inteiro; texto vazio, nada', () => {
    expect(segmentarComEmojis('só texto', [])).toEqual([{ tipo: 'texto', texto: 'só texto' }]);
    expect(segmentarComEmojis('', emojis)).toEqual([]);
  });

  it('emojis colados e nas pontas', () => {
    expect(segmentarComEmojis(':kappa::kappa:', emojis).map((s) => s.tipo)).toEqual(['emoji', 'emoji']);
  });
});
