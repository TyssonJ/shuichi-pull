import bruto from '@/data/personagens.json';
import { validarPersonagens, type Personagem } from './schema';

// Valida uma vez no import: se o dado estiver quebrado, o build falha.
const personagens: Personagem[] = validarPersonagens(bruto);

export function listarPersonagens(): Personagem[] {
  return personagens;
}

export function buscarPersonagem(id: string): Personagem | null {
  return personagens.find((p) => p.id === id) ?? null;
}

export function valoresDoElenco(
  atributo: 'velocidade' | 'mochila' | 'percepcao'
): number[] {
  return personagens.map((p) => p[atributo]);
}
