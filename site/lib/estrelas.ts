export const COMENTARIO_MIN = 5;
export const COMENTARIO_MAX = 300;
export const ESTRELAS_MIN = 0;
export const ESTRELAS_MAX = 5;

type Resultado<T> = { ok: true; valor: T } | { ok: false; erro: string };

export function estrelasValidas(valor: unknown): valor is number {
  return typeof valor === 'number' && Number.isInteger(valor) && valor >= ESTRELAS_MIN && valor <= ESTRELAS_MAX;
}

/** Avaliação dada no site: nota de 0 a 5 e texto OBRIGATÓRIO — a nota sozinha
 * não diz nada sobre a pessoa, e o texto é o que a pessoa avaliada lê. */
export function validarAvaliacao(estrelas: number, comentario: string | null | undefined): Resultado<{ estrelas: number; comentario: string }> {
  if (!estrelasValidas(estrelas)) return { ok: false, erro: 'A nota vai de 0 a 5 estrelas.' };
  const texto = (comentario ?? '').replace(/\r\n/g, '\n').trim();
  if (texto.length < COMENTARIO_MIN) return { ok: false, erro: `Escreva a avaliação (mínimo ${COMENTARIO_MIN} caracteres).` };
  if (texto.length > COMENTARIO_MAX) return { ok: false, erro: `A avaliação passa de ${COMENTARIO_MAX} caracteres.` };
  return { ok: true, valor: { estrelas, comentario: texto } };
}
