import { describe, it, expect } from 'vitest';
import { escolherSprite, numeroDaPose, normalizarTitulo } from './escolher-sprite';

describe('numeroDaPose', () => {
  it('lê o número entre parênteses e o número solto', () => {
    expect(numeroDaPose('Nagito Komaeda Halfbody Sprite (13).png')).toBe(13);
    expect(numeroDaPose('Makoto Naegi Halfbody Sprite 08.png')).toBe(8);
  });

  it('manda para o fim da fila quem não tem número', () => {
    expect(numeroDaPose('Alguem Sprite.png')).toBe(999);
  });
});

describe('normalizarTitulo', () => {
  it('tira o prefixo File:', () => {
    expect(normalizarTitulo('File:Makoto Naegi Halfbody Sprite 02.png')).toBe(
      'Makoto Naegi Halfbody Sprite 02.png'
    );
  });
});

describe('escolherSprite', () => {
  it('pega a pose de menor número', () => {
    const r = escolherSprite(
      [
        'File:Nagito Komaeda Halfbody Sprite (13).png',
        'File:Nagito Komaeda Halfbody Sprite (2).png',
        'File:Nagito Komaeda Halfbody Sprite (22).png',
      ],
      'Nagito Komaeda'
    );
    expect(r).toBe('Nagito Komaeda Halfbody Sprite (2).png');
  });

  it('descarta cadáver, variante PSP e afins', () => {
    const r = escolherSprite(
      [
        'File:Makoto Naegi Halfbody Sprite PSP 01.png',
        'File:Makoto Naegi Halfbody Sprite (Deceased) (1).png',
        'File:Makoto Naegi Halfbody Sprite 08.png',
      ],
      'Makoto Naegi'
    );
    expect(r).toBe('Makoto Naegi Halfbody Sprite 08.png');
  });

  it('prefere o sprite do jogo em que a ficha está', () => {
    const titulos = [
      'File:Kyouko Kyoko Kirigiri Halfbody Sprite (3).png',
      'File:Danganronpa 2 Kyoko Kirigiri Halfbody Sprite (1).png',
    ];
    expect(escolherSprite(titulos, 'Kyoko Kirigiri', 'Danganronpa 2: Goodbye Despair'))
      .toBe('Danganronpa 2 Kyoko Kirigiri Halfbody Sprite (1).png');
    expect(escolherSprite(titulos, 'Kyoko Kirigiri', 'Danganronpa: Trigger Happy Havoc'))
      .toBe('Kyouko Kyoko Kirigiri Halfbody Sprite (3).png');
  });

  it('ignora quem não é o personagem procurado', () => {
    const r = escolherSprite(
      ['File:Byakuya Togami Halfbody Sprite (1).png'], 'Makoto Naegi'
    );
    expect(r).toBeNull();
  });

  it('devolve null quando não sobra candidato', () => {
    expect(escolherSprite([], 'Makoto Naegi')).toBeNull();
  });
});
