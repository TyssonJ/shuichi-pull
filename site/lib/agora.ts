/**
 * "Agora" pra páginas dinâmicas (renderizadas a cada pedido): o horário do
 * pedido é o que se quer, de propósito. Fica numa função de módulo porque a
 * regra de pureza do React não enxerga através dela — e assim o motivo mora
 * num lugar só, em vez de um eslint-disable em cada página.
 */
export const agoraMs = (): number => Date.now();
