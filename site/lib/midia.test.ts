import { describe, it, expect } from 'vitest';
import {
  ehUrlDeMidia, validarArquivoDeUpload, formatarTamanho, ehTipoUpload, tipoDeMidia, LIMITES_UPLOAD, formatarSegundos,
} from './midia';
import { MIDIA_HOST } from './midia-host';

describe('ehUrlDeMidia', () => {
  it('aceita só arquivo do nosso Blob, em https', () => {
    expect(ehUrlDeMidia(`https://${MIDIA_HOST}/perfil/a-x1.png`)).toBe(true);
    expect(ehUrlDeMidia(`http://${MIDIA_HOST}/a.png`)).toBe(false);
  });

  it('recusa outro store da Vercel, host parecido e credenciais', () => {
    expect(ehUrlDeMidia('https://outrostore123.public.blob.vercel-storage.com/a.png')).toBe(false);
    expect(ehUrlDeMidia(`https://${MIDIA_HOST}.evil.example/a.png`)).toBe(false);
    expect(ehUrlDeMidia(`https://evil.example/${MIDIA_HOST}/a.png`)).toBe(false);
    expect(ehUrlDeMidia(`https://user:pw@${MIDIA_HOST}/a.png`)).toBe(false);
    expect(ehUrlDeMidia('não é url')).toBe(false);
  });
});

describe('validarArquivoDeUpload', () => {
  it('aceita imagem dentro do limite do uso', () => {
    expect(validarArquivoDeUpload('icone', { tamanho: 500 * 1024, mime: 'image/png' })).toEqual({ ok: true });
    expect(validarArquivoDeUpload('imagem', { tamanho: 4 * 1024 * 1024, mime: 'image/webp' })).toEqual({ ok: true });
  });

  it('cada uso tem o próprio teto (ícone 1 MB, imagem 5 MB, vídeo do chat 40 MB, vídeo 150 MB)', () => {
    expect(validarArquivoDeUpload('icone', { tamanho: 2 * 1024 * 1024, mime: 'image/png' }).ok).toBe(false);
    expect(validarArquivoDeUpload('imagem', { tamanho: 6 * 1024 * 1024, mime: 'image/png' }).ok).toBe(false);
    expect(validarArquivoDeUpload('chat-video', { tamanho: 41 * 1024 * 1024, mime: 'video/mp4' }).ok).toBe(false);
    expect(validarArquivoDeUpload('video-perfil', { tamanho: 100 * 1024 * 1024, mime: 'video/mp4' }).ok).toBe(true);
    expect(validarArquivoDeUpload('video-perfil', { tamanho: 151 * 1024 * 1024, mime: 'video/mp4' }).ok).toBe(false);
  });

  it('recusa formato errado pro uso (vídeo como ícone, exe, svg com script)', () => {
    for (const mime of ['video/mp4', 'application/x-msdownload', 'image/svg+xml', 'text/html']) {
      const r = validarArquivoDeUpload('icone', { tamanho: 1000, mime });
      expect(r.ok).toBe(false);
      expect(!r.ok && r.erro).toContain('Formato não aceito');
    }
    expect(validarArquivoDeUpload('video-perfil', { tamanho: 1000, mime: 'image/png' }).ok).toBe(false);
  });

  it('a mensagem de tamanho diz o tamanho real e o limite', () => {
    const r = validarArquivoDeUpload('icone', { tamanho: 3 * 1024 * 1024, mime: 'image/png' });
    expect(!r.ok && r.erro).toContain('3,0 MB');
    expect(!r.ok && r.erro).toContain('1,0 MB');
  });

  it('arquivo vazio', () => {
    expect(validarArquivoDeUpload('imagem', { tamanho: 0, mime: 'image/png' }).ok).toBe(false);
  });
});

describe('utilitários', () => {
  it('formatarTamanho', () => {
    expect(formatarTamanho(512)).toBe('1 KB');
    expect(formatarTamanho(200 * 1024)).toBe('200 KB');
    expect(formatarTamanho(1.5 * 1024 * 1024)).toBe('1,5 MB');
    expect(formatarTamanho(120 * 1024 * 1024)).toBe('120 MB');
  });

  it('ehTipoUpload e tipoDeMidia', () => {
    for (const t of Object.keys(LIMITES_UPLOAD)) expect(ehTipoUpload(t)).toBe(true);
    expect(ehTipoUpload('script')).toBe(false);
    expect(ehTipoUpload(undefined)).toBe(false);
    expect(tipoDeMidia('video/mp4')).toBe('video');
    expect(tipoDeMidia('image/gif')).toBe('imagem');
  });
});

describe('formatarSegundos', () => {
  it.each([[45, '45 s'], [60, '1 min'], [80, '1 min 20 s'], [300, '5 min'], [0, '0 s'], [-3, '0 s']])('%i -> %s', (n, esperado) => {
    expect(formatarSegundos(n)).toBe(esperado);
  });
});
