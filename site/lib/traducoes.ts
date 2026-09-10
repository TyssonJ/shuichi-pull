import elenco from '@/data/traducoes/elenco.pt.json';
import itens from '@/data/traducoes/itens.pt.json';
import locais from '@/data/traducoes/locais.pt.json';
import conteineres from '@/data/traducoes/conteineres.pt.json';
import etiquetas from '@/data/traducoes/etiquetas.pt.json';
import descricoes from '@/data/traducoes/descricoes.pt.json';
import talentosPorPersonagem from '@/data/traducoes/talentos-por-personagem.pt.json';
import perfilExpandido from '@/data/traducoes/perfil-expandido.pt.json';

// Um dicionário só, com o inglês como chave. Os arquivos são separados por
// assunto para o ADM revisar cada seção sem esbarrar na outra.
const mapa: Record<string, string> = {
  ...(elenco as Record<string, string>),
  ...(itens as Record<string, string>),
  ...(locais as Record<string, string>),
  ...(conteineres as Record<string, string>),
  ...(etiquetas as Record<string, string>),
};

export function traduzirPt(chave: string): string | null {
  return mapa[chave] ?? null;
}

/**
 * O genero do talento vem do personagem, nao do talento: Kyoko e Shuichi sao
 * os dois "Ultimate Detective". Quem precisa de correcao entra no arquivo de
 * override; o resto usa a traducao generica.
 */
export function talentoDoPersonagem(id: string): string | null {
  return (talentosPorPersonagem as Record<string, string>)[id] ?? null;
}

export function descricaoDoPersonagem(id: string): string | null {
  return (descricoes as Record<string, string>)[id] ?? null;
}

export type PerfilExpandido = {
  personalidade?: string;
  aparencia?: string;
  historia?: string;
  segredo?: string;
};

export function perfilExpandidoDoPersonagem(id: string): PerfilExpandido | null {
  return (perfilExpandido as Record<string, PerfilExpandido>)[id] ?? null;
}
