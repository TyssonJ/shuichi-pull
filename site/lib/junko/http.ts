import { z } from 'zod';

/** Discord IDs são números (snowflakes) de até ~20 dígitos. */
export const schemaDiscordId = z.string().regex(/^\d{5,25}$/, 'discordId inválido');

export function discordIdValido(valor: string): boolean {
  return schemaDiscordId.safeParse(valor).success;
}

type Lido<T> = { ok: true; dados: T } | { ok: false; resposta: Response };

/** Lê e valida o corpo JSON. Corpo ausente, malformado ou fora do formato
 * vira 400 com a lista do que está errado — o bot precisa saber o motivo. */
export async function lerCorpo<T>(request: Request, schema: z.ZodType<T>): Promise<Lido<T>> {
  let bruto: unknown;
  try {
    bruto = await request.json();
  } catch {
    return { ok: false, resposta: Response.json({ erro: 'O corpo precisa ser um JSON válido.' }, { status: 400 }) };
  }
  const r = schema.safeParse(bruto);
  if (!r.success) {
    const problemas = r.error.issues.map((i) => `${i.path.join('.') || 'corpo'}: ${i.message}`);
    return { ok: false, resposta: Response.json({ erro: 'Corpo inválido.', problemas }, { status: 400 }) };
  }
  return { ok: true, dados: r.data };
}

export const naoEncontrado = (mensagem: string) => Response.json({ erro: mensagem }, { status: 404 });
