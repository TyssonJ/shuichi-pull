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

  it('prefere meio-corpo a corpo inteiro, mesmo com número maior', () => {
    const r = escolherSprite(
      [
        'File:Korekiyo Shinguji Fullbody Sprite (1).png',
        'File:Korekiyo Shinguji Halfbody Sprite (7).png',
      ],
      'Korekiyo Shinguji'
    );
    expect(r).toBe('Korekiyo Shinguji Halfbody Sprite (7).png');
  });

  it('aceita corpo inteiro quando não há meio-corpo', () => {
    const r = escolherSprite(['File:Mondo Owada Fullbody Sprite (2).png'], 'Mondo Owada');
    expect(r).toBe('Mondo Owada Fullbody Sprite (2).png');
  });

  it('ignora quem não é o personagem procurado', () => {
    const r = escolherSprite(
      ['File:Byakuya Togami Halfbody Sprite (1).png'], 'Makoto Naegi'
    );
    expect(r).toBeNull();
  });

  it('descarta o recorte de scrum debate, que é alto e estreito', () => {
    const r = escolherSprite(
      [
        'File:Danganronpa V3 Shuichi Saihara Halfbody Sprite (Debate Scrum) (1).png',
        'File:Danganronpa V3 Shuichi Saihara Halfbody Sprite (Hat) (3).png',
      ],
      'Shuichi Saihara'
    );
    expect(r).toBe('Danganronpa V3 Shuichi Saihara Halfbody Sprite (Hat) (3).png');
  });

  it('não cai no cosplay de outro personagem', () => {
    const r = escolherSprite(
      [
        'File:Danganronpa V3 Tsumugi Shirogane Halfbody Sprite (Nekomaru Nidai) (1).png',
        'File:Nekomaru Nidai Halfbody Sprite (4).png',
      ],
      'Nekomaru Nidai'
    );
    expect(r).toBe('Nekomaru Nidai Halfbody Sprite (4).png');
  });

  it('prefere a roupa padrão a uma variante de figurino', () => {
    const r = escolherSprite(
      [
        'File:Korekiyo Shinguji Halfbody Sprite (High School Uniform) (1).png',
        'File:Korekiyo Shinguji Halfbody Sprite (5).png',
      ],
      'Korekiyo Shinguji'
    );
    expect(r).toBe('Korekiyo Shinguji Halfbody Sprite (5).png');
  });

  it('trata plataforma no nome como variante neutra', () => {
    const r = escolherSprite(
      [
        'File:Danganronpa 1 Mondo Owada Halfbody Sprite (Mobile) (1).png',
        'File:Danganronpa 1 Mondo Owada Halfbody Sprite (Alt) (1).png',
      ],
      'Mondo Owada'
    );
    expect(r).toBe('Danganronpa 1 Mondo Owada Halfbody Sprite (Mobile) (1).png');
  });

  it('devolve null quando não sobra candidato', () => {
    expect(escolherSprite([], 'Makoto Naegi')).toBeNull();
  });
});
