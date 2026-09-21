import { z } from 'zod';
import { schemaDiscordId } from './http';
import { estrelasValidas, COMENTARIO_MAX } from '../estrelas';

/**
 * Avaliação que veio do Junko Bot (contrato em docs/junko-bot-api.md).
 * O formato é o mesmo tanto quando o bot ENVIA (POST /api/junko/avaliacoes/)
 * quanto quando o site BUSCA (importação pelo painel do chefe).
 *
 * Diferente do site, aqui o texto é opcional: o bot pode ter avaliações só
 * com nota. O `externoId` é o id da avaliação no bot e é o que permite
 * repetir a importação sem duplicar.
 */
const schemaItem = z.object({
  externoId: z.union([z.string(), z.number()]).transform(String).pipe(z.string().min(1).max(100)),
  avaliadoDiscordId: schemaDiscordId,
  avaliadorDiscordId: schemaDiscordId.optional().nullable(),
  estrelas: z.number().refine(estrelasValidas, 'estrelas precisa ser um inteiro de 0 a 5'),
  comentario: z.string().nullish(),
  criadoEm: z.string().datetime({ offset: true }).optional().nullable(),
});

export type AvaliacaoExterna = {
  externoId: string;
  avaliadoDiscordId: string;
  avaliadorDiscordId: string | null;
  estrelas: number;
  comentario: string | null;
  criadoEm: Date | null;
};

export type AvaliacaoIgnorada = { externoId: string | null; motivo: string };

export const LIMITE_LOTE_AVALIACOES = 100;

/** "algo.a" -> "algo.a: mensagem", ou só a mensagem quando o problema é na raiz. */
const descrever = (i: z.ZodIssue) => (i.path.length ? `${i.path.join('.')}: ${i.message}` : i.message);

/**
 * Valida um lote item a item: um item ruim NÃO derruba os outros, ele vai pra
 * `ignoradas` com o motivo — quem mandou precisa saber o que corrigir.
 * `conhecidos` são os discordIds que existem no site: avaliar quem nunca
 * entrou aqui não tem onde aparecer.
 */
export function normalizarAvaliacoesExternas(
  bruto: unknown,
  conhecidos: ReadonlySet<string>,
): { validas: AvaliacaoExterna[]; ignoradas: AvaliacaoIgnorada[] } {
  if (!Array.isArray(bruto)) {
    return { validas: [], ignoradas: [{ externoId: null, motivo: 'esperava uma lista de avaliações' }] };
  }
  if (bruto.length > LIMITE_LOTE_AVALIACOES) {
    return { validas: [], ignoradas: [{ externoId: null, motivo: `no máximo ${LIMITE_LOTE_AVALIACOES} avaliações por vez` }] };
  }

  const validas: AvaliacaoExterna[] = [];
  const ignoradas: AvaliacaoIgnorada[] = [];
  const vistos = new Set<string>();

  for (const item of bruto) {
    const r = schemaItem.safeParse(item);
    const idBruto = typeof item === 'object' && item !== null && 'externoId' in item ? String((item as { externoId: unknown }).externoId) : null;
    if (!r.success) {
      ignoradas.push({ externoId: idBruto, motivo: r.error.issues.map(descrever).join('; ') });
      continue;
    }
    const d = r.data;
    if (vistos.has(d.externoId)) {
      ignoradas.push({ externoId: d.externoId, motivo: 'externoId repetido no mesmo lote' });
      continue;
    }
    vistos.add(d.externoId);
    if (!conhecidos.has(d.avaliadoDiscordId)) {
      ignoradas.push({ externoId: d.externoId, motivo: 'a pessoa avaliada ainda não entrou no site' });
      continue;
    }
    if (d.avaliadorDiscordId && d.avaliadorDiscordId === d.avaliadoDiscordId) {
      ignoradas.push({ externoId: d.externoId, motivo: 'ninguém avalia a si mesmo' });
      continue;
    }

    const texto = (d.comentario ?? '').replace(/\r\n/g, '\n').trim();
    validas.push({
      externoId: d.externoId,
      avaliadoDiscordId: d.avaliadoDiscordId,
      avaliadorDiscordId: d.avaliadorDiscordId ?? null,
      estrelas: d.estrelas,
      comentario: texto ? texto.slice(0, COMENTARIO_MAX) : null,
      criadoEm: d.criadoEm ? new Date(d.criadoEm) : null,
    });
  }
  return { validas, ignoradas };
}
