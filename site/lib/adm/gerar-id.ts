// Faixa dos diacríticos combinantes (U+0300–U+036F), montada por código: digitar
// o intervalo literal no fonte já fez o editor trocar a sequência de escape
// pelos próprios glifos, e aí a regex parava de casar.
const DIACRITICOS = new RegExp(
  String.fromCharCode(0x5b, 0x5c, 0x75, 0x30, 0x33, 0x30, 0x30, 0x2d, 0x5c, 0x75, 0x30, 0x33, 0x36, 0x66, 0x5d),
  'g',
);

/** "Espada Flamejante" -> "espada-flamejante" (kebab-case sem acento). */
export function gerarId(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(DIACRITICOS, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
