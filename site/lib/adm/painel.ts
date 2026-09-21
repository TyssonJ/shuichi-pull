export type Segmento = { rotulo: string; valor: number; cor: string };

const FUSO = 'America/Sao_Paulo';

const COR = {
  verde: '#00FF66', ciano: '#00F0FF', rosa: '#FF007F', ambar: '#F59E0B', apagado: '#4A4A55',
} as const;

/** Partidas por status, na ordem que conta a história: abertas, feitas, canceladas. */
export function segmentosDeStatus(partidas: { status: string }[]): Segmento[] {
  const n = (s: string) => partidas.filter((p) => p.status === s).length;
  return [
    { rotulo: 'Agendadas', valor: n('agendada'), cor: COR.verde },
    { rotulo: 'Finalizadas', valor: n('finalizada'), cor: COR.ciano },
    { rotulo: 'Canceladas', valor: n('cancelada'), cor: COR.rosa },
  ];
}

/** "Pendente" só conta quem de fato informou um UID — sem UID não há o que revisar. */
export function segmentosDeUid(
  usuarios: { uuidGmod: string | null; uuidStatus: 'pendente' | 'aprovado' | 'banido' }[],
): Segmento[] {
  const comUid = usuarios.filter((u) => u.uuidGmod);
  const n = (s: string) => comUid.filter((u) => u.uuidStatus === s).length;
  return [
    { rotulo: 'Aprovados', valor: n('aprovado'), cor: COR.verde },
    { rotulo: 'Pendentes', valor: n('pendente'), cor: COR.ambar },
    { rotulo: 'Banidos', valor: n('banido'), cor: COR.rosa },
    { rotulo: 'Sem UID', valor: usuarios.length - comUid.length, cor: COR.apagado },
  ];
}

/** "2026-09-21" no fuso de Brasília — o dia que o ADM vê no relógio dele. */
function diaBR(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: FUSO, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

/** Ações por dia nos últimos `dias` dias (do mais antigo pro de hoje), com zeros nos dias vazios. */
export function atividadePorDia(
  linhas: { criadoEm: Date }[], dias: number, agora: Date,
): { dia: string; rotulo: string; total: number }[] {
  const contagem = new Map<string, number>();
  for (const l of linhas) contagem.set(diaBR(l.criadoEm), (contagem.get(diaBR(l.criadoEm)) ?? 0) + 1);

  return Array.from({ length: dias }, (_, i) => {
    const d = new Date(agora.getTime() - (dias - 1 - i) * 86_400_000);
    const dia = diaBR(d);
    const [, mes, dd] = dia.split('-');
    return { dia, rotulo: `${dd}/${mes}`, total: contagem.get(dia) ?? 0 };
  });
}

const ACOES: Record<string, string> = {
  'item.criar': 'criou o item', 'item.editar': 'editou o item',
  'item.excluir': 'removeu o item', 'item.restaurar': 'restaurou o item',
  'personagem.criar': 'criou o personagem', 'personagem.editar': 'editou o personagem',
  'personagem.excluir': 'removeu o personagem', 'personagem.restaurar': 'restaurou o personagem',
  'correcao.criar': 'corrigiu', 'correcao.reverter': 'reverteu a correção de',
  'evento.criar': 'publicou o evento', 'evento.editar': 'editou o evento', 'evento.excluir': 'apagou o evento',
  'codigo.criar': 'cadastrou o código', 'codigo.editar': 'editou o código', 'codigo.excluir': 'apagou o código',
  'partida.cancelar_adm': 'cancelou a partida', 'partida.transferir_host': 'passou o host da partida',
  'usuario.status_uuid': 'mudou o UID de', 'usuario.pode_ser_host': 'mudou a permissão de host de',
  'adm.promover': 'promoveu', 'adm.rebaixar': 'rebaixou',
  'configuracao.definir': 'mudou a configuração',
};

export function descreverAcao(acao: string): string {
  return ACOES[acao] ?? acao;
}

/** Uma linha do log do Alter Ego: "[21/09 02:10] Fulano criou o item espada (Espada)". */
export function linhaDeLog(
  l: { criadoEm: Date; autor: string; acao: string; alvo: string; valorNovo: string | null },
  nomes: ReadonlyMap<string, string>,
): { hora: string; autor: string; texto: string } {
  const hora = new Intl.DateTimeFormat('pt-BR', {
    timeZone: FUSO, day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  }).format(l.criadoEm).replace(', ', ' ');
  const alvo = nomes.get(l.alvo) ?? l.alvo;
  const detalhe = l.valorNovo && l.valorNovo !== alvo ? ` → ${l.valorNovo}` : '';
  return { hora, autor: nomes.get(l.autor) ?? l.autor, texto: `${descreverAcao(l.acao)} ${alvo}${detalhe}` };
}
