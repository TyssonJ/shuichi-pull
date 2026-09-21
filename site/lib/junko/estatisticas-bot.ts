import { z } from 'zod';
import { discordIdValido } from './http';

/**
 * Dados que o Junko Bot já publica na API dele (leitura pública, sem chave):
 *   GET <bot>/api/usuario/<discordId>     → economia e estatísticas de um jogador
 *   GET <bot>/api/leaderboard/<categoria> → top 10 (riqueza | vitorias | assassinatos)
 * ATENÇÃO: as rotas do bot NÃO aceitam barra no final (com barra dão 404).
 *
 * O bot é uma fonte externa: tudo que chega é validado, tem timeout curto e
 * NUNCA lança — indisponível vira um resultado que quem chama trata (o
 * perfil simplesmente não mostra o cartão). A chave de saída do site não é
 * enviada: são rotas públicas e não há por que expô-la a elas.
 */
export const CATEGORIAS_RANKING = ['riqueza', 'vitorias', 'assassinatos'] as const;
export type CategoriaRanking = (typeof CATEGORIAS_RANKING)[number];

export function ehCategoriaRanking(valor: string): valor is CategoriaRanking {
  return (CATEGORIAS_RANKING as readonly string[]).includes(valor);
}

export type PerfilDoBot = {
  jcoins: number;
  partidas: number;
  vitorias: number;
  mvps: number;
  /** Mains como o bot guarda (texto livre, ex.: "Mikan Tsumiki"). */
  mains: string | null;
  titulo: string | null;
  /** #rrggbb do título equipado, ou null se o bot mandou algo que não é cor. */
  corTitulo: string | null;
  sequenciaDiaria: number;
  /** ISO do último resgate diário, ou null. */
  ultimoDiarioEm: string | null;
};

export type ItemDoRanking = { posicao: number; discordId: string; nome: string; valor: number; partidas: number | null };
export type RankingDoBot = { categoria: CategoriaRanking; itens: ItemDoRanking[] };

export type BuscaBot<T> =
  | { ok: true; dados: T }
  | { ok: false; motivo: 'nao-encontrado' | 'indisponivel' | 'resposta-invalida' };

const TIMEOUT_MS = 3000;
/** Quanto o site reaproveita a resposta do bot (economia muda devagar). */
const REVALIDAR_S = 60;

const numero = z.number().finite().catch(0);
const texto = z.string().trim().max(120).nullish().catch(null);
const cor = z.string().regex(/^#[0-9a-fA-F]{6}$/).nullish().catch(null);

const schemaPerfil = z.object({
  jcoins: numero,
  partidas: numero,
  vitorias: numero,
  mvps: numero,
  mains: texto,
  titulo_equipado: texto,
  cor_titulo: cor,
  daily_streak: numero,
  last_daily: z.number().finite().nullish().catch(null),
});

const CAMPO_DO_VALOR: Record<CategoriaRanking, string> = { riqueza: 'jcoins', vitorias: 'vitorias', assassinatos: 'mvps' };

const schemaItem = z.object({
  user_id: z.string().regex(/^\d{5,25}$/),
  discord_name: z.string().trim().max(80).catch('—'),
  partidas: z.number().finite().nullish().catch(null),
}).passthrough();

type Buscar = typeof fetch;

async function lerJson(url: string, buscar: Buscar): Promise<BuscaBot<unknown>> {
  try {
    const resposta = await buscar(url, {
      headers: { Accept: 'application/json', 'X-Origem': 'shuichipull' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      redirect: 'manual',
      next: { revalidate: REVALIDAR_S },
    });
    if (resposta.status === 404) return { ok: false, motivo: 'nao-encontrado' };
    if (!resposta.ok) return { ok: false, motivo: 'indisponivel' };
    try {
      return { ok: true, dados: await resposta.json() };
    } catch {
      return { ok: false, motivo: 'resposta-invalida' };
    }
  } catch {
    return { ok: false, motivo: 'indisponivel' };
  }
}

/** Perfil de um jogador no bot. `nao-encontrado` = a pessoa nunca usou o bot. */
export async function buscarPerfilDoBot(urlBot: string, discordId: string, buscar: Buscar = fetch): Promise<BuscaBot<PerfilDoBot>> {
  if (!discordIdValido(discordId)) return { ok: false, motivo: 'nao-encontrado' };
  const r = await lerJson(`${urlBot}/api/usuario/${encodeURIComponent(discordId)}`, buscar);
  if (!r.ok) return r;

  const p = schemaPerfil.safeParse(r.dados);
  if (!p.success) return { ok: false, motivo: 'resposta-invalida' };
  const d = p.data;
  return {
    ok: true,
    dados: {
      jcoins: d.jcoins,
      partidas: d.partidas,
      vitorias: d.vitorias,
      mvps: d.mvps,
      mains: d.mains || null,
      titulo: d.titulo_equipado || null,
      corTitulo: d.cor_titulo ?? null,
      sequenciaDiaria: d.daily_streak,
      ultimoDiarioEm: d.last_daily ? new Date(d.last_daily * 1000).toISOString() : null,
    },
  };
}

/** Top do bot numa categoria. Item malformado é descartado sem derrubar a lista. */
export async function buscarRankingDoBot(urlBot: string, categoria: CategoriaRanking, buscar: Buscar = fetch): Promise<BuscaBot<RankingDoBot>> {
  const r = await lerJson(`${urlBot}/api/leaderboard/${categoria}`, buscar);
  if (!r.ok) return r;

  const lista = (r.dados as { ranking?: unknown } | null)?.ranking;
  if (!Array.isArray(lista)) return { ok: false, motivo: 'resposta-invalida' };

  const campo = CAMPO_DO_VALOR[categoria];
  const itens: ItemDoRanking[] = [];
  for (const bruto of lista.slice(0, 20)) {
    const item = schemaItem.safeParse(bruto);
    const valor = item.success ? (item.data as Record<string, unknown>)[campo] : undefined;
    if (!item.success || typeof valor !== 'number' || !Number.isFinite(valor)) continue;
    itens.push({
      posicao: itens.length + 1,
      discordId: item.data.user_id,
      nome: item.data.discord_name,
      valor,
      partidas: item.data.partidas ?? null,
    });
  }
  return { ok: true, dados: { categoria, itens } };
}
