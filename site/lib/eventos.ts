import { z } from 'zod';
import brutoEventos from '@/content/eventos.json';
import brutoCodigos from '@/content/codigos.json';

const DATA = /^\d{4}-\d{2}-\d{2}$/;

export const EventoSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'id deve ser kebab-case'),
  tipo: z.enum(['evento', 'noticia', 'atualizacao']),
  titulo: z.string().min(1),
  data: z.string().regex(DATA, 'data deve ser AAAA-MM-DD'),
  ate: z.string().regex(DATA).nullable(),
  destaque: z.boolean(),
  autor: z.string().min(1),
  resumo: z.string().min(1),
  corpo: z.string().min(1),
});
export type Evento = z.infer<typeof EventoSchema>;

export const CodigoSchema = z.object({
  codigo: z.string().min(1),
  recompensa: z.string().min(1),
  descricao: z.string().min(1),
  expiraEm: z.string().regex(DATA).nullable(),
  fonte: z.string().url().nullable(),
});
export type Codigo = z.infer<typeof CodigoSchema>;

const eventos: Evento[] = z.array(EventoSchema).parse(brutoEventos);
const codigos: Codigo[] = z.array(CodigoSchema).parse(brutoCodigos);

/** Do mais recente para o mais antigo; destaque sobe. */
export function listarEventos(): Evento[] {
  return [...eventos].sort(
    (a, b) => Number(b.destaque) - Number(a.destaque) || b.data.localeCompare(a.data)
  );
}

export function buscarEvento(id: string): Evento | null {
  return eventos.find((e) => e.id === id) ?? null;
}

export function listarCodigos(): Codigo[] {
  return codigos;
}

/**
 * Um código sem data de expiração nunca vence. A comparação é feita no fuso
 * local de quem lê, com o dia inteiro valendo — um código que expira dia 10
 * ainda funciona durante o dia 10.
 */
export function estaExpirado(codigo: Codigo, agora: Date = new Date()): boolean {
  if (!codigo.expiraEm) return false;
  const [ano, mes, dia] = codigo.expiraEm.split('-').map(Number);
  return agora.getTime() > new Date(ano, mes - 1, dia, 23, 59, 59, 999).getTime();
}

export function separarCodigos(agora: Date = new Date()): {
  ativos: Codigo[]; expirados: Codigo[];
} {
  return {
    ativos: codigos.filter((c) => !estaExpirado(c, agora)),
    expirados: codigos.filter((c) => estaExpirado(c, agora)),
  };
}
