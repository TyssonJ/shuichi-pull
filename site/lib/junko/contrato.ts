/** Resumo do contrato site ⇄ bot, mostrado no painel do chefe.
 * A versão completa (payloads, exemplos) está em docs/junko-bot-api.md. */

export const ENDPOINTS_DO_SITE: { metodo: string; caminho: string; descricao: string }[] = [
  { metodo: 'GET', caminho: '/api/junko/status/', descricao: 'Confere se a chave vale.' },
  { metodo: 'GET', caminho: '/api/junko/partidas/', descricao: 'Próximas partidas, vagas e inscritos.' },
  { metodo: 'GET', caminho: '/api/junko/usuarios/{discordId}/', descricao: 'Perfil, UID e estatísticas de um jogador.' },
  { metodo: 'POST', caminho: '/api/junko/usuarios/{discordId}/uid/', descricao: 'Aprovar, banir ou pôr em pendente o UID.' },
  { metodo: 'POST', caminho: '/api/junko/partidas/{id}/inscricao/', descricao: 'Inscrever alguém numa partida.' },
  { metodo: 'DELETE', caminho: '/api/junko/partidas/{id}/inscricao/', descricao: 'Tirar alguém da partida.' },
];

export const EVENTOS_PARA_O_BOT: { evento: string; quando: string }[] = [
  { evento: 'partida.criada', quando: 'Um host abre uma sala nova.' },
  { evento: 'partida.cancelada', quando: 'O host ou um ADM cancela a partida.' },
  { evento: 'partida.finalizada', quando: 'O host marca a partida como finalizada.' },
  { evento: 'inscricao.entrou', quando: 'Alguém entra numa partida (titular ou reserva).' },
  { evento: 'inscricao.saiu', quando: 'Alguém sai de uma partida.' },
  { evento: 'uid.enviado', quando: 'Um jogador informa ou troca o UID (fica pendente).' },
  { evento: 'uid.status', quando: 'Um ADM aprova, bane ou devolve o UID pra pendente.' },
  { evento: 'host.permissao', quando: 'Um ADM libera ou revoga a permissão de host.' },
  { evento: 'teste', quando: 'Botão "Enviar evento de teste" deste painel.' },
];
