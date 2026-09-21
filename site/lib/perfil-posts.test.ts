import { describe, it, expect } from 'vitest';
import {
  validarTextoPost, validarAnexosPost, postVazio, contarVideos, POST_TEXTO_MAX, POST_ANEXOS_MAX, type AnexoPost,
} from './perfil-posts';
import { MIDIA_HOST } from './midia-host';

const url = (n: string) => `https://${MIDIA_HOST}/imagem/${n}`;
const img = (n: string): AnexoPost => ({ tipo: 'imagem', url: url(n), duracaoSegundos: null });
const video = (n: string, s: number | null): AnexoPost => ({ tipo: 'video', url: `https://${MIDIA_HOST}/video-perfil/${n}`, duracaoSegundos: s });

describe('validarTextoPost', () => {
  it('apara, padroniza quebras de linha e limita linhas em branco seguidas', () => {
    expect(validarTextoPost('  oi\r\n\r\n\r\n\r\n\r\nfim  ')).toEqual({ ok: true, valor: 'oi\n\n\nfim' });
  });

  it('recusa caractere de controle, mas aceita quebra de linha e tab', () => {
    expect(validarTextoPost('a\u0000b').ok).toBe(false);
    expect(validarTextoPost('a\tb\nc')).toMatchObject({ ok: true });
  });

  it('limita em caracteres (emoji conta como um)', () => {
    expect(validarTextoPost('😀'.repeat(POST_TEXTO_MAX)).ok).toBe(true);
    const longo = validarTextoPost('a'.repeat(POST_TEXTO_MAX + 1));
    expect(!longo.ok && longo.erro).toContain(String(POST_TEXTO_MAX));
  });
});

describe('validarAnexosPost', () => {
  it('aceita imagens e um vídeo de até 5 min (arredonda a duração)', () => {
    const r = validarAnexosPost([img('a.png'), video('v.mp4', 299.6)]);
    expect(r).toMatchObject({ ok: true });
    expect(r.ok && r.valor[1].duracaoSegundos).toBe(300);
  });

  it('recusa vídeo acima de 5 min, duração inválida e mais de um vídeo', () => {
    const longo = validarAnexosPost([video('v.mp4', 301)]);
    expect(!longo.ok && longo.erro).toContain('o máximo é 5 min');
    expect(validarAnexosPost([video('v.mp4', -1)]).ok).toBe(false);
    expect(validarAnexosPost([video('v.mp4', Number.NaN)]).ok).toBe(false);
    expect(validarAnexosPost([video('a.mp4', 10), video('b.mp4', 10)]).ok).toBe(false);
  });

  it('recusa link de fora do nosso Blob, repetido e excesso de arquivos', () => {
    expect(validarAnexosPost([{ tipo: 'imagem', url: 'https://evil.example/x.png', duracaoSegundos: null }]).ok).toBe(false);
    expect(validarAnexosPost([img('a.png'), img('a.png')]).ok).toBe(false);
    const muitos = Array.from({ length: POST_ANEXOS_MAX + 1 }, (_, i) => img(`${i}.png`));
    expect(validarAnexosPost(muitos).ok).toBe(false);
  });

  it('duração desconhecida (null) passa: o teto real é o tamanho do arquivo', () => {
    expect(validarAnexosPost([video('v.mp4', null)])).toMatchObject({ ok: true });
  });
});

describe('postVazio / contarVideos', () => {
  it('post sem texto e sem arquivo é vazio', () => {
    expect(postVazio('', [])).toBe(true);
    expect(postVazio('oi', [])).toBe(false);
    expect(postVazio('', [img('a.png')])).toBe(false);
  });

  it('conta vídeos em vários posts', () => {
    expect(contarVideos([{ anexos: [video('a', 1), img('b.png')] }, { anexos: [video('c', 2)] }, { anexos: [] }])).toBe(2);
  });
});
