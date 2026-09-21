export type Resultado = 'vitoria_alunos' | 'vitoria_mestre' | 'tragedia' | null;

export type PartidaParaStats = {
  id: number;
  blackened: string | null;
  mvpDiscordIds: string[];
  resultado: Resultado;
};

export type CapituloParaStats = {
  partidaId: number;
  assassinoDiscordId: string | null;
  vitimaDiscordId: string | null;
  afk: string[];
};

export type Desfecho = 'vitoria' | 'derrota' | 'tragedia';

export type Estatisticas = {
  total: number;
  vitorias: number;
  derrotas: number;
  tragedias: number;
  comoBlackened: number;
  comoDetetive: number;
  /** Vitórias como não-blackened: o grupo pegou o culpado. */
  casosResolvidos: number;
  mvps: number;
  /** Partidas em que foi a vítima em algum capítulo. */
  assassinado: number;
  /** Partidas em que ficou AFK / caiu em algum capítulo. */
  afk: number;
};

/**
 * O culpado é quem o host marcou como blackened no resumo OU quem foi
 * assassino em algum capítulo do relatório — o host pode preencher só um
 * dos dois, e as duas formas têm que contar.
 */
export function foiBlackened(
  discordId: string, partida: PartidaParaStats, capitulos: CapituloParaStats[],
): boolean {
  return partida.blackened === discordId
    || capitulos.some((c) => c.partidaId === partida.id && c.assassinoDiscordId === discordId);
}

/** null = partida finalizada sem desfecho no relatório (não conta nem vitória nem derrota). */
export function desfechoParaUsuario(
  discordId: string, partida: PartidaParaStats, capitulos: CapituloParaStats[],
): Desfecho | null {
  if (partida.resultado === 'tragedia') return 'tragedia';
  if (partida.resultado === null) return null;
  const culpado = foiBlackened(discordId, partida, capitulos);
  if (partida.resultado === 'vitoria_mestre') return culpado ? 'vitoria' : 'derrota';
  return culpado ? 'derrota' : 'vitoria';
}

export function calcularEstatisticas(
  discordId: string, partidas: PartidaParaStats[], capitulos: CapituloParaStats[],
): Estatisticas {
  const e: Estatisticas = {
    total: partidas.length, vitorias: 0, derrotas: 0, tragedias: 0,
    comoBlackened: 0, comoDetetive: 0, casosResolvidos: 0, mvps: 0, assassinado: 0, afk: 0,
  };

  for (const p of partidas) {
    const caps = capitulos.filter((c) => c.partidaId === p.id);
    const culpado = foiBlackened(discordId, p, caps);
    if (culpado) e.comoBlackened++; else e.comoDetetive++;
    if (p.mvpDiscordIds.includes(discordId)) e.mvps++;
    if (caps.some((c) => c.vitimaDiscordId === discordId)) e.assassinado++;
    if (caps.some((c) => c.afk.includes(discordId))) e.afk++;

    const desfecho = desfechoParaUsuario(discordId, p, caps);
    if (desfecho === 'tragedia') e.tragedias++;
    else if (desfecho === 'derrota') e.derrotas++;
    else if (desfecho === 'vitoria') {
      e.vitorias++;
      if (!culpado) e.casosResolvidos++;
    }
  }
  return e;
}
