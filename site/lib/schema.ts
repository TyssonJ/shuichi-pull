import { z } from 'zod';

export const TextoSchema = z.object({ pt: z.string().min(1), en: z.string().min(1) });
export type Texto = z.infer<typeof TextoSchema>;

export const EtiquetaSchema = z.object({
  pt: z.string().min(1),
  en: z.string().min(1),
  bom: z.boolean(),
});
export type Etiqueta = z.infer<typeof EtiquetaSchema>;

export const PersonagemSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'id deve ser kebab-case'),
  nome: z.string().min(1),
  talento: TextoSchema,
  descricao: TextoSchema,
  jogo: z.string().min(1),
  velocidade: z.number().int().min(100).max(400),
  mochila: z.number().int().min(1).max(200),
  percepcao: z.number().int().min(1).max(10),
  vida: z.number().int().min(1),
  etiquetas: z.array(EtiquetaSchema),
  sprite: z.string().min(1),
  traducaoRevisada: z.boolean(),
  // Perfil expandido da ficha aberta — texto original (não é tradução da
  // wiki), então só PT. Opcional: preenchido personagem por personagem.
  // Personalidade e aparência ficam abertas; história e segredo, atrás do
  // cofre do Alter Ego (contêm spoiler de enredo).
  personalidade: z.string().min(1).optional(),
  aparencia: z.string().min(1).optional(),
  historia: z.string().min(1).optional(),
  segredo: z.string().min(1).optional(),
});
export type Personagem = z.infer<typeof PersonagemSchema>;

export function validarPersonagens(dados: unknown): Personagem[] {
  return z.array(PersonagemSchema).parse(dados);
}
