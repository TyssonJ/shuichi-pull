import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

/**
 * Chave que o Junko Bot manda no cabeçalho Authorization pra falar com a API
 * do site. O site NUNCA guarda a chave, só o hash dela: se o banco vazar, o
 * vazamento não dá acesso à API. A chave em texto aparece uma única vez, na
 * hora de gerar, no painel do chefe.
 */
export const PREFIXO_CHAVE = 'jk_';

export function gerarChave(): string {
  return PREFIXO_CHAVE + randomBytes(32).toString('base64url');
}

export function hashDaChave(chave: string): string {
  return createHash('sha256').update(chave).digest('hex');
}

/** Comparação em tempo constante, pra não vazar a chave por tempo de resposta. */
export function chaveConfere(chave: string, hashGuardado: string | null | undefined): boolean {
  if (!hashGuardado) return false;
  const a = Buffer.from(hashDaChave(chave), 'hex');
  const b = Buffer.from(hashGuardado, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}

/** "Bearer abc" -> "abc". Qualquer outra forma é rejeitada. */
export function extrairBearer(cabecalho: string | null): string | null {
  const m = /^Bearer\s+(\S+)$/i.exec(cabecalho ?? '');
  return m ? m[1] : null;
}
