import bruto from '@/data/personagens.json';
import { validarPersonagens, type Personagem } from './schema';
import { repositorioCorrecoes } from '@/db/repositorios/correcoes';
import { aplicarCorrecoes } from './correcoes-merge';

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

export async function listarPersonagensComCorrecoes(): Promise<Personagem[]> {
  const correcoes = await repositorioCorrecoes.buscarCorrecoesPorColecao('personagens');
  return aplicarCorrecoes(personagens, correcoes);
}

export async function buscarPersonagemComCorrecoes(id: string): Promise<Personagem | null> {
  const lista = await listarPersonagensComCorrecoes();
  return lista.find((p) => p.id === id) ?? null;
}
