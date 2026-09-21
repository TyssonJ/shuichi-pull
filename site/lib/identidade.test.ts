import { describe, it, expect } from 'vitest';
import { validarApelido, resolverAvatar, identidadeDe, APELIDO_MAX } from './identidade';

describe('validarApelido', () => {
  it('aceita, apara e junta espaços repetidos', () => {
    expect(validarApelido('  Kokichi   Ouma  ')).toEqual({ ok: true, valor: 'Kokichi Ouma' });
  });

  it('acentos, emoji e escrita não latina valem', () => {
    expect(validarApelido('João ✨').ok).toBe(true);
    expect(validarApelido('ジュンコ').ok).toBe(true);
  });

  it('vazio remove o apelido', () => {
    expect(validarApelido('   ')).toEqual({ ok: true, valor: null });
  });

  it('limites de tamanho (contando o caractere, não o byte)', () => {
    expect(validarApelido('a').ok).toBe(false);
    expect(validarApelido('a'.repeat(APELIDO_MAX)).ok).toBe(true);
    expect(validarApelido('a'.repeat(APELIDO_MAX + 1)).ok).toBe(false);
    expect(validarApelido('a' + '😀'.repeat(APELIDO_MAX - 1)).ok).toBe(true);
    expect(validarApelido('a' + '😀'.repeat(APELIDO_MAX)).ok).toBe(false);
  });

  it('recusa caracteres invisíveis, de controle e de inversão de texto', () => {
    for (const codigo of [0x200b, 0x202e, 0x0000, 0x2066]) {
      expect(validarApelido('ab' + String.fromCharCode(codigo) + 'cd').ok).toBe(false);
    }
  });

  it('exige ao menos uma letra ou número', () => {
    expect(validarApelido('!!!')).toEqual({ ok: false, erro: expect.stringContaining('letra ou número') });
    expect(validarApelido('✨✨').ok).toBe(false);
  });
});

describe('resolverAvatar', () => {
  const elenco = new Map([['makoto', '/sprites/elenco/makoto.webp']]);

  it('discord é o padrão e não tem ícone personalizado', () => {
    expect(resolverAvatar('discord', '', elenco)).toEqual({ ok: true, valor: null });
  });

  it('personagem do elenco vira o endereço do sprite; fora do elenco, erro', () => {
    expect(resolverAvatar('personagem', 'makoto', elenco)).toEqual({
      ok: true, valor: { tipo: 'personagem', valor: 'makoto', url: '/sprites/elenco/makoto.webp' },
    });
    expect(resolverAvatar('personagem', 'fantasma', elenco).ok).toBe(false);
  });

  it('link só de hospedagens permitidas, https', () => {
    expect(resolverAvatar('url', 'https://i.imgur.com/a.png', elenco).ok).toBe(true);
    expect(resolverAvatar('url', 'https://evil.example/a.png', elenco).ok).toBe(false);
    expect(resolverAvatar('url', 'http://i.imgur.com/a.png', elenco).ok).toBe(false);
  });

  it('tipo desconhecido', () => {
    expect(resolverAvatar('script', 'x', elenco).ok).toBe(false);
  });
});

describe('identidadeDe', () => {
  const base = { discordNome: 'tysson', discordAvatar: 'https://cdn.discord/a.png', apelido: null, avatarUrl: null };

  it('sem personalização: só o Discord, sem originais em separado', () => {
    expect(identidadeDe(base)).toEqual({ nome: 'tysson', avatar: 'https://cdn.discord/a.png', nomeOriginal: null, avatarOriginal: null });
  });

  it('com apelido e ícone: destaque personalizado + originais pequenos ao lado', () => {
    expect(identidadeDe({ ...base, apelido: 'Shuichi', avatarUrl: '/sprites/elenco/shuichi.webp' })).toEqual({
      nome: 'Shuichi', avatar: '/sprites/elenco/shuichi.webp', nomeOriginal: 'tysson', avatarOriginal: 'https://cdn.discord/a.png',
    });
  });

  it('só o apelido: o avatar segue o do Discord e não repete', () => {
    const i = identidadeDe({ ...base, apelido: 'Shuichi' });
    expect(i).toMatchObject({ nome: 'Shuichi', avatar: base.discordAvatar, nomeOriginal: 'tysson', avatarOriginal: null });
  });

  it('apelido igual ao nome do Discord não repete o original', () => {
    expect(identidadeDe({ ...base, apelido: 'tysson' }).nomeOriginal).toBeNull();
  });
});
