// Nunca guardar em cache: a resposta só serve se for a hora deste instante.
export const dynamic = 'force-dynamic';

/**
 * Hora do servidor, pro navegador medir a diferença do relógio dele (lib/relogio.ts).
 * Sem login e sem dado nenhum além do horário.
 */
export function GET() {
  return Response.json({ agora: Date.now() }, { headers: { 'Cache-Control': 'no-store' } });
}
