import { describe, it, expect } from 'vitest';
import {
  BIO_MAX, BANNER_PADRAO, PRESETS_BANNER, validarBio, validarBanner, validarUrlBanner, bannerDoRegistro, fundoDoPreset,
} from './perfil-visual';

const ELENCO = new Set(['shuichi-saihara', 'kaede-akamatsu']);

describe('validarBio', () => {
  it('aceita texto normal e apara espaços', () => {
    expect(validarBio('  oi, sou detetive  ')).toEqual({ ok: true, valor: 'oi, sou detetive' });
  });

  it('vazio vira null (perfil sem descrição)', () => {
    expect(validarBio('   \n ')).toEqual({ ok: true, valor: null });
  });

  it('rejeita acima do limite e aceita exatamente no limite', () => {
    expect(validarBio('a'.repeat(BIO_MAX)).ok).toBe(true);
    expect(validarBio('a'.repeat(BIO_MAX + 1)).ok).toBe(false);
  });

  it('colapsa mais de duas quebras de linha seguidas', () => {
    expect(validarBio('a\n\n\n\n\nb')).toEqual({ ok: true, valor: 'a\n\nb' });
  });
});

describe('validarUrlBanner', () => {
  it('aceita https em hospedagem permitida', () => {
    const r = validarUrlBanner('https://i.imgur.com/abc123.png');
    expect(r).toEqual({ ok: true, valor: 'https://i.imgur.com/abc123.png' });
  });

  it('rejeita http, mesmo em host permitido', () => {
    expect(validarUrlBanner('http://i.imgur.com/abc.png').ok).toBe(false);
  });

  it('rejeita host fora da lista, incluindo o CDN do Discord que expira', () => {
    expect(validarUrlBanner('https://cdn.discordapp.com/attachments/1/2/x.png').ok).toBe(false);
    expect(validarUrlBanner('https://evil.example/x.png').ok).toBe(false);
  });

  it('não deixa subdomínio enganar a checagem de host', () => {
    expect(validarUrlBanner('https://i.imgur.com.evil.example/x.png').ok).toBe(false);
    expect(validarUrlBanner('https://evil.example/i.imgur.com/x.png').ok).toBe(false);
  });

  it('rejeita credenciais embutidas, lixo e link gigante', () => {
    expect(validarUrlBanner('https://user:pw@i.imgur.com/x.png').ok).toBe(false);
    expect(validarUrlBanner('isso nao e link').ok).toBe(false);
    expect(validarUrlBanner(`https://i.imgur.com/${'a'.repeat(400)}.png`).ok).toBe(false);
  });

  it('a mensagem de erro lista os hosts aceitos', () => {
    const r = validarUrlBanner('https://evil.example/x.png');
    expect(!r.ok && r.erro).toContain('i.imgur.com');
  });
});

describe('validarBanner', () => {
  it('preset conhecido', () => {
    expect(validarBanner('preset', 'execucao', ELENCO)).toEqual({ ok: true, valor: { tipo: 'preset', valor: 'execucao' } });
  });

  it('preset inexistente', () => {
    expect(validarBanner('preset', 'nao-existe', ELENCO).ok).toBe(false);
  });

  it('personagem só se estiver no elenco atual', () => {
    expect(validarBanner('personagem', 'shuichi-saihara', ELENCO).ok).toBe(true);
    expect(validarBanner('personagem', 'personagem-removido', ELENCO).ok).toBe(false);
  });

  it('url passa pela validação de host', () => {
    expect(validarBanner('url', 'https://i.ibb.co/x/y.jpg', ELENCO).ok).toBe(true);
    expect(validarBanner('url', 'https://evil.example/y.jpg', ELENCO).ok).toBe(false);
  });

  it('tipo desconhecido', () => {
    expect(validarBanner('script', 'x', ELENCO).ok).toBe(false);
  });
});

describe('bannerDoRegistro', () => {
  it('sem nada gravado usa o padrão', () => {
    expect(bannerDoRegistro(null, null, ELENCO)).toEqual(BANNER_PADRAO);
  });

  it('personagem que saiu do elenco cai no padrão em vez de quebrar', () => {
    expect(bannerDoRegistro('personagem', 'removido', ELENCO)).toEqual(BANNER_PADRAO);
  });

  it('devolve o banner válido gravado', () => {
    expect(bannerDoRegistro('preset', 'ciano', ELENCO)).toEqual({ tipo: 'preset', valor: 'ciano' });
  });
});

describe('fundoDoPreset', () => {
  it('todo preset tem fundo e id único', () => {
    const ids = PRESETS_BANNER.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const p of PRESETS_BANNER) expect(fundoDoPreset(p.id)).toBe(p.fundo);
  });

  it('id desconhecido devolve o primeiro', () => {
    expect(fundoDoPreset('x')).toBe(PRESETS_BANNER[0].fundo);
  });
});
