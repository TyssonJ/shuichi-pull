/**
 * Erros esperados das server actions (validação, regra de negócio) voltam
 * como VALOR, não como exceção: em produção o Next apaga a mensagem de
 * qualquer erro lançado numa server action (só sobra um `digest`), então
 * "As vagas de titular acabaram" chegaria ao navegador como o texto genérico
 * do React. Valor atravessa a rede intacto.
 *
 * Este arquivo é seguro pro navegador (sem imports de servidor).
 */
export type ResultadoAcao<T = void> = { ok: true; dados: T } | { ok: false; erro: string };

/** O que uma action pode devolver: o valor direto ou o envelope {ok,…}. */
export type Acao<T = void> = Promise<T | ResultadoAcao<T>>;

function ehResultado(valor: unknown): valor is ResultadoAcao<unknown> {
  return typeof valor === 'object' && valor !== null && typeof (valor as { ok?: unknown }).ok === 'boolean';
}

/**
 * Chame em volta da action: devolve os dados, ou lança Error(mensagem) se a
 * action respondeu {ok:false}. Assim o try/catch do formulário continua igual.
 * Aceita também action que ainda devolve o valor direto (sem envelope).
 */
export async function desembrulhar<T>(promessa: Promise<T | ResultadoAcao<T>>): Promise<T> {
  const r = await promessa;
  if (ehResultado(r)) {
    if (!r.ok) throw new Error(r.erro);
    return r.dados as T;
  }
  return r as T;
}

/** Texto que o React usa no lugar da mensagem real de um erro em produção. */
const MENSAGEM_OCULTADA = /omitted in production|Server Components render/i;

/** Mensagem pra mostrar ao usuário: a do erro, se ela é legível; senão o
 * `padrao`. Nunca deixa vazar o texto técnico do React pra tela. */
export function mensagemDeErro(erro: unknown, padrao: string): string {
  if (!(erro instanceof Error) || !erro.message || MENSAGEM_OCULTADA.test(erro.message)) return padrao;
  return erro.message;
}
