export type DefinicaoConfig = {
  chave: string;
  rotulo: string;
  descricao: string;
  padrao: boolean;
};

/**
 * Todo toggle visível pro ADM em /adm/configuracoes vive aqui — um registro
 * central em vez de flags espalhadas, pra deixar fácil adicionar o próximo
 * sem precisar de migração (a tabela é chave/valor genérica).
 */
export const TOGGLES: DefinicaoConfig[] = [
  {
    chave: 'elenco.mostrarBadgePendente',
    rotulo: 'Selo "PENDENTE" no elenco',
    descricao: 'Mostra um selo nos cartões de personagem cuja tradução ainda não foi revisada por um ADM.',
    padrao: true,
  },
];

export function paraBooleano(valor: string | null | undefined, padrao: boolean): boolean {
  if (valor === null || valor === undefined) return padrao;
  return valor === 'true';
}

export function obterToggle(config: Record<string, string>, chave: string): boolean {
  const definicao = TOGGLES.find((t) => t.chave === chave);
  return paraBooleano(config[chave], definicao?.padrao ?? true);
}
