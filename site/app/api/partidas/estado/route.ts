import { repositorioPartidas } from '@/db/repositorios/partidas';
import { lerIds } from '@/lib/estado-partida';

export const dynamic = 'force-dynamic';

/**
 * Estado atual de algumas partidas (`?ids=14,15`): só status e horários de
 * início e fim, que já são públicos na página da partida. O monitor da página
 * chama isto de tempos em tempos e recarrega a página quando algo mudou (o host
 * apertou "Começar" ou finalizou).
 */
export async function GET(req: Request) {
  const ids = lerIds(new URL(req.url).searchParams.get('ids'));
  if (ids.length === 0) return Response.json({ erro: 'Passe ?ids=14,15.' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });

  const linhas = await repositorioPartidas.estados(ids);
  const estados: Record<string, { status: string; iniciadaEm: string | null }> = {};
  for (const l of linhas) {
    estados[String(l.id)] = { status: l.status, iniciadaEm: l.iniciadaEm ? l.iniciadaEm.toISOString() : null };
  }
  return Response.json({ estados }, { headers: { 'Cache-Control': 'no-store' } });
}
