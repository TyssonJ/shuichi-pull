export const ROTULO_STATUS: Record<string, string> = {
  agendada: 'AGENDADA', em_andamento: 'EM ANDAMENTO', finalizada: 'FINALIZADA', cancelada: 'CANCELADA',
};

/** Vocabulário do relatório pós-partida (valores internos: vitoria_alunos etc.). */
export const ROTULO_RESULTADO: Record<string, string> = {
  vitoria_alunos: 'Cápsulas (culpado capturado)',
  vitoria_mestre: 'Vitória do assassino',
  tragedia: 'Sobreviventes sem resolução',
};

/** Versão curta pra selo em cartão pequeno. */
export const SELO_RESULTADO: Record<string, string> = {
  vitoria_alunos: 'CÁPSULAS',
  vitoria_mestre: 'ASSASSINO VENCEU',
  tragedia: 'SOBREVIVENTES',
};
