/**
 * Modo leve: menos animação e efeito visual, pra aparelho fraco ou conexão
 * ruim. Liga/desliga pelo botão do cabeçalho, a escolha fica guardada no
 * navegador, e sem escolha o site decide sozinho a partir de sinais do
 * aparelho (quem pediu menos movimento, economia de dados, pouca memória ou
 * poucos núcleos). O efeito é o atributo `data-leve` no <html>, que o CSS
 * (app/globals.css) e alguns componentes leem.
 */
export const CHAVE_MODO_LEVE = 'shuichi-modo-leve';
export const EVENTO_MODO_LEVE = 'modo-leve:mudou';
export const ATRIBUTO_MODO_LEVE = 'data-leve';

export type SinaisDoAparelho = {
  reduzirMovimento: boolean;
  economiaDeDados: boolean;
  memoriaGB: number | null;
  nucleos: number | null;
};

/** Escolha guardada ('1' = leve, '0' = normal) vence; sem escolha, valem os sinais do aparelho. */
export function decidirModoLeve(escolha: string | null, sinais: SinaisDoAparelho): boolean {
  if (escolha === '1') return true;
  if (escolha === '0') return false;
  return (
    sinais.reduzirMovimento
    || sinais.economiaDeDados
    || (sinais.memoriaGB !== null && sinais.memoriaGB <= 2)
    || (sinais.nucleos !== null && sinais.nucleos <= 2)
  );
}

/**
 * Roda no <head>, ANTES da primeira pintura, pra o site já nascer no modo certo
 * (sem piscar do pesado pro leve). Tem que ser texto solto, sem depender de
 * módulo, e nunca pode lançar. É a mesma regra de `decidirModoLeve` — o teste
 * roda os dois contra os mesmos casos pra não divergirem.
 */
export const SCRIPT_MODO_LEVE = `(function(){try{var e=null;try{e=localStorage.getItem('${CHAVE_MODO_LEVE}')}catch(_){}var l;if(e==='1')l=true;else if(e==='0')l=false;else{var c=navigator.connection||{};l=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)||c.saveData===true||(typeof navigator.deviceMemory==='number'&&navigator.deviceMemory<=2)||(typeof navigator.hardwareConcurrency==='number'&&navigator.hardwareConcurrency<=2)}if(l)document.documentElement.setAttribute('${ATRIBUTO_MODO_LEVE}','1')}catch(_){}})();`;

type ConexaoComEconomia = { saveData?: boolean };

/** Lê os sinais do aparelho (só no navegador). */
export function lerSinaisDoAparelho(): SinaisDoAparelho {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: ConexaoComEconomia };
  return {
    reduzirMovimento: typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    economiaDeDados: nav.connection?.saveData === true,
    memoriaGB: typeof nav.deviceMemory === 'number' ? nav.deviceMemory : null,
    nucleos: typeof nav.hardwareConcurrency === 'number' ? nav.hardwareConcurrency : null,
  };
}

/** O site está no modo leve agora? (lê o atributo que o script/botão aplicaram) */
export function modoLeveAtivo(): boolean {
  return document.documentElement.getAttribute(ATRIBUTO_MODO_LEVE) === '1';
}

/** Liga ou desliga, guarda a escolha e avisa quem está ouvindo. */
export function definirModoLeve(ligado: boolean): void {
  try {
    localStorage.setItem(CHAVE_MODO_LEVE, ligado ? '1' : '0');
  } catch { /* navegador sem storage: vale só até fechar a página */ }
  if (ligado) document.documentElement.setAttribute(ATRIBUTO_MODO_LEVE, '1');
  else document.documentElement.removeAttribute(ATRIBUTO_MODO_LEVE);
  window.dispatchEvent(new Event(EVENTO_MODO_LEVE));
}

/** A pessoa já escolheu (ligou ou desligou) alguma vez? */
export function jaEscolheuModoLeve(): boolean {
  try {
    return localStorage.getItem(CHAVE_MODO_LEVE) !== null;
  } catch {
    return false;
  }
}

/** Abaixo disso (em quadros por segundo) o site está pesado pro aparelho. */
export const FPS_MINIMO_CONFORTAVEL = 25;
/** Quadros descartados no começo da medição (o primeiro costuma ser o mais lento). */
const QUADROS_DE_AQUECIMENTO = 3;
/** Menos amostras que isso = medição inválida (aba oculta, congelada…): não sugere nada. */
const AMOSTRAS_MINIMAS = 20;

/**
 * Dado o tempo (ms) entre quadros consecutivos medido com requestAnimationFrame,
 * o aparelho está sofrendo? Serve pra oferecer o modo leve a quem não sabe que
 * ele existe.
 */
export function aparelhoSofrendo(intervalosMs: number[]): boolean {
  const uteis = intervalosMs.slice(QUADROS_DE_AQUECIMENTO).filter((n) => Number.isFinite(n) && n > 0);
  if (uteis.length < AMOSTRAS_MINIMAS) return false;
  const media = uteis.reduce((a, b) => a + b, 0) / uteis.length;
  return 1000 / media < FPS_MINIMO_CONFORTAVEL;
}
