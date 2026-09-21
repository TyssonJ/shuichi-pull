/**
 * Pra onde o botão "✎ EDITAR" do cabeçalho leva um ADM, a partir da página
 * pública em que ele está. Página de um registro (personagem, item, local)
 * abre o editor já nesse registro.
 */
export type AtalhoEdicao = { href: string; rotulo: string };

const LISTAGENS: Record<string, { href: string; rotulo: string }> = {
  elenco: { href: '/adm/personagens/', rotulo: 'Editar elenco' },
  itens: { href: '/adm/itens/', rotulo: 'Editar itens' },
  mapa: { href: '/adm/mapa/', rotulo: 'Editar mapa' },
};

const REGISTROS: Record<string, string> = {
  elenco: '/adm/personagens/',
  itens: '/adm/itens/',
  mapa: '/adm/mapa/',
};

export function atalhoDeEdicao(pathname: string): AtalhoEdicao | null {
  const partes = pathname.split('/').filter(Boolean);
  const [secao, id] = partes;

  if (secao === 'adm' || secao === 'api') return null;
  if (partes.length === 0) return { href: '/adm/textos/#home', rotulo: 'Editar textos da home' };

  switch (secao) {
    case 'faq': return { href: '/adm/faq/', rotulo: 'Editar FAQ' };
    case 'mecanicas': return { href: '/adm/mecanicas/', rotulo: 'Editar mecânicas' };
    case 'eventos': return { href: '/adm/eventos/', rotulo: 'Editar eventos' };
    case 'codigos': return { href: '/adm/codigos/', rotulo: 'Editar códigos' };
    case 'partidas': return { href: '/adm/partidas/', rotulo: 'Gerir partidas' };
    case 'u': return { href: '/adm/usuarios/', rotulo: 'Gerir usuários' };
    case 'elenco':
    case 'itens':
    case 'mapa':
      return id
        ? { href: `${REGISTROS[secao]}?abrir=${encodeURIComponent(id)}`, rotulo: 'Editar esta página' }
        : LISTAGENS[secao];
    default: return null;
  }
}
