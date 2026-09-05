/**
 * Escolhe, entre os arquivos que a wiki devolve, o sprite mais neutro do
 * personagem. A busca traz poses de todos os jogos e variantes (cadaver,
 * versao PSP, sem ahoge); nada disso serve de retrato padrao.
 */

const DESCARTA = /(deceased|corpse|despair|psp|no ahoge|report card|symbol|icon|beta|concept|manga|anime|thumb)/i;

const PREFIXO_POR_JOGO: Record<string, RegExp> = {
  'Danganronpa: Trigger Happy Havoc': /^(?!danganronpa (2|v3|another))/i,
  'Danganronpa 2: Goodbye Despair': /danganronpa 2/i,
  'Danganronpa V3: Killing Harmony': /danganronpa v3|^drs /i,
  'Ultra Despair Girls': /another episode|udg|ultra despair/i,
};

export function normalizarTitulo(titulo: string): string {
  return titulo.replace(/^File:/, '').trim();
}

/** Numero da pose no nome do arquivo; sem numero, vai para o fim da fila. */
export function numeroDaPose(titulo: string): number {
  const achado = /\((\d+)\)|sprite\D{0,3}(\d+)/i.exec(titulo);
  const n = achado?.[1] ?? achado?.[2];
  return n ? Number(n) : 999;
}

export function escolherSprite(
  titulos: string[], nome: string, jogo?: string
): string | null {
  const sobrenome = nome.split(' ').slice(-1)[0].toLowerCase();
  const candidatos = titulos
    .map(normalizarTitulo)
    .filter((t) => t.toLowerCase().includes(sobrenome))
    .filter((t) => !DESCARTA.test(t))
    .filter((t) => /\.(png|jpg|jpeg|webp)$/i.test(t));

  if (candidatos.length === 0) return null;

  const doJogo = jogo && PREFIXO_POR_JOGO[jogo]
    ? candidatos.filter((t) => PREFIXO_POR_JOGO[jogo].test(t))
    : [];
  const fila = doJogo.length > 0 ? doJogo : candidatos;

  return [...fila].sort((a, b) => numeroDaPose(a) - numeroDaPose(b) || a.localeCompare(b))[0];
}
