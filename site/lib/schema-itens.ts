import { z } from 'zod';
import { TextoSchema } from './schema';

export const IngredienteSchema = z.object({
  id: z.string().nullable(),
  nome: TextoSchema,
  qtd: z.number().int().positive(),
  icone: z.string().nullable(),
});

export const CraftSchema = z.object({
  ingredientes: z.array(IngredienteSchema).min(1),
  bancadas: z.array(TextoSchema),
  chance: z.string().min(1),
});

/** Um ponto de spawn: contêiner, local, andar e a chance de sair o item. */
export const SpawnSchema = z.object({
  fonteId: z.string().min(1),
  local: TextoSchema,
  localId: z.string().min(1),
  andar: TextoSchema.nullable(),
  conteiner: TextoSchema,
  chance: z.number().min(0).max(100),
  qtdMin: z.number().int().min(0),
  qtdMax: z.number().int().min(0),
});

export const ItemSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'id deve ser kebab-case'),
  nome: TextoSchema,
  categoria: TextoSchema,
  ramo: TextoSchema,
  raridade: TextoSchema,
  nivelRaridade: z.number().int().min(0).max(5),
  peso: z.number().min(0).nullable(),
  // Entradas internas do jogo nao tem arte no guidebook.
  icone: z.string().nullable(),
  descricao: TextoSchema.nullable(),
  efeito: TextoSchema.nullable(),
  // cures/applies vem como lista no dado bruto e hp/hunger como texto solto;
  // a ingestao normaliza tudo para lista.
  mecanicas: z.record(z.string(), z.array(z.string())),
  loja: z.object({ vendedor: z.string(), preco: z.number() }).nullable(),
  craft: CraftSchema.nullable(),
  spawns: z.array(SpawnSchema),
  traducaoRevisada: z.boolean(),
});
export type Item = z.infer<typeof ItemSchema>;
export type Spawn = z.infer<typeof SpawnSchema>;
export type Craft = z.infer<typeof CraftSchema>;

export const ConteinerSchema = z.object({
  fonteId: z.string().min(1),
  nome: TextoSchema,
  itens: z.array(z.object({
    id: z.string().min(1),
    nome: TextoSchema,
    chance: z.number().min(0).max(100),
    qtdMin: z.number().int().min(0),
    qtdMax: z.number().int().min(0),
  })),
});

export const LocalSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'id deve ser kebab-case'),
  nome: TextoSchema,
  andar: TextoSchema.nullable(),
  conteineres: z.array(ConteinerSchema),
  totalItens: z.number().int().min(0),
  traducaoRevisada: z.boolean(),
});
export type Local = z.infer<typeof LocalSchema>;
export type Conteiner = z.infer<typeof ConteinerSchema>;

export function validarItens(dados: unknown): Item[] {
  return z.array(ItemSchema).parse(dados);
}

export function validarLocais(dados: unknown): Local[] {
  return z.array(LocalSchema).parse(dados);
}
