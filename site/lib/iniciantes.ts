import { z } from 'zod';
import conteudo from '@/content/iniciantes.pt.json';

const BlocoSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  titulo: z.string().min(1),
  texto: z.string().min(1),
});

const FaseSchema = z.object({
  n: z.string().min(1),
  nome: z.string().min(1),
  texto: z.string().min(1),
});

const PassoSchema = z.object({
  n: z.number().int().positive(),
  titulo: z.string().min(1),
  texto: z.string().min(1),
});

const LinkSchema = z.object({
  rotulo: z.string().min(1),
  url: z.string().url(),
  descricao: z.string().min(1),
});

const IniciantesSchema = z.object({
  chamada: z.string().min(1),
  resumo: z.string().min(1),
  blocos: z.array(BlocoSchema).min(1),
  fases: z.array(FaseSchema).length(4),
  passos: z.array(PassoSchema).min(1),
  dicas: z.array(z.string().min(1)).min(1),
  links: z.array(LinkSchema).min(1),
});

export type Iniciantes = z.infer<typeof IniciantesSchema>;

// Valida no import: se um ADM quebrar o arquivo, o build falha em vez de
// publicar uma página torta.
const dados: Iniciantes = IniciantesSchema.parse(conteudo);

export function conteudoIniciantes(): Iniciantes {
  return dados;
}
