import { temInvisiveis } from './identidade';

export const CARGO_NOME_MIN = 2;
export const CARGO_NOME_MAX = 24;

type Resultado<T> = { ok: true; valor: T } | { ok: false; erro: string };

export type DadosCargo = { nome: string; cor: string };

/** Nome sem espaço sobrando nem caractere invisível, cor no formato #rrggbb. */
export function validarCargo(entrada: { nome: string; cor: string }): Resultado<DadosCargo> {
  const nome = entrada.nome.normalize('NFC').replace(/\s+/g, ' ').trim();
  if (temInvisiveis(nome)) return { ok: false, erro: 'O nome do cargo tem caracteres invisíveis.' };
  const tamanho = [...nome].length;
  if (tamanho < CARGO_NOME_MIN) return { ok: false, erro: `O nome do cargo precisa de ao menos ${CARGO_NOME_MIN} caracteres.` };
  if (tamanho > CARGO_NOME_MAX) return { ok: false, erro: `O nome do cargo passa de ${CARGO_NOME_MAX} caracteres.` };

  const cor = entrada.cor.trim().toLowerCase();
  if (!/^#[0-9a-f]{6}$/.test(cor)) return { ok: false, erro: 'A cor precisa estar no formato #RRGGBB (ex.: #00ff66).' };
  return { ok: true, valor: { nome, cor } };
}

/** Luminância relativa (WCAG) de uma cor #rrggbb, de 0 (preto) a 1 (branco). */
export function luminancia(hex: string): number {
  const canais = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * canais[0] + 0.7152 * canais[1] + 0.0722 * canais[2];
}

/** Cor do texto que dá leitura sobre o fundo do cargo: escuro em fundo claro e
 * vice-versa — o ADM escolhe qualquer cor sem se preocupar com contraste. */
export function corDoTextoSobre(fundo: string): '#08090D' | '#F2F2F5' {
  return luminancia(fundo) > 0.35 ? '#08090D' : '#F2F2F5';
}
