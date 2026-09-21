import { z } from 'zod';
import { exigirChaveJunko, AUTOR_JUNKO } from '@/lib/junko/autenticar';
import { lerCorpo } from '@/lib/junko/http';
import { importarAvaliacoes } from '@/lib/junko/importar-avaliacoes';
import { repositorioPartidaAvaliacoes } from '@/db/repositorios/partida-avaliacoes';

const LIMITE_PADRAO = 100;
const LIMITE_MAXIMO = 200;

/**
 * Site → bot: avaliações dadas NO SITE, das mais antigas pras mais novas.
 * Nunca traz quem avaliou (a avaliação é anônima) nem devolve ao bot o que
 * ele mesmo mandou. Pra paginar, use `proximo` como `desde` da próxima chamada.
 */
export async function GET(request: Request) {
  const negado = await exigirChaveJunko(request);
  if (negado) return negado;

  const params = new URL(request.url).searchParams;
  const desdeBruto = params.get('desde');
  const desde = desdeBruto ? new Date(desdeBruto) : null;
  if (desde && Number.isNaN(desde.getTime())) {
    return Response.json({ erro: '`desde` precisa ser uma data ISO 8601.' }, { status: 400 });
  }
  const pedido = Number(params.get('limite') ?? LIMITE_PADRAO);
  const limite = Number.isInteger(pedido) && pedido > 0 ? Math.min(pedido, LIMITE_MAXIMO) : LIMITE_PADRAO;

  const linhas = await repositorioPartidaAvaliacoes.listarDoSiteParaOBot(desde, limite);
  return Response.json({
    avaliacoes: linhas.map((l) => ({ ...l, criadoEm: l.criadoEm.toISOString() })),
    // Página cheia = pode haver mais; o cursor é a data da última.
    proximo: linhas.length === limite ? linhas[linhas.length - 1].criadoEm.toISOString() : null,
  });
}

const schemaLote = z.object({ avaliacoes: z.array(z.unknown()) });

/**
 * Bot → site: manda um lote de avaliações que ele tem. Idempotente pelo
 * `externoId`. Item ruim não derruba o lote: volta em `ignoradas` com o motivo.
 */
export async function POST(request: Request) {
  const negado = await exigirChaveJunko(request);
  if (negado) return negado;

  const corpo = await lerCorpo(request, schemaLote);
  if (!corpo.ok) return corpo.resposta;

  const r = await importarAvaliacoes(corpo.dados.avaliacoes, AUTOR_JUNKO);
  return Response.json({ ok: true, ...r });
}
