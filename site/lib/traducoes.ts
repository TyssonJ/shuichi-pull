import elenco from '@/data/traducoes/elenco.pt.json';
import itens from '@/data/traducoes/itens.pt.json';
import locais from '@/data/traducoes/locais.pt.json';
import conteineres from '@/data/traducoes/conteineres.pt.json';

// Um dicionário só, com o inglês como chave. Os arquivos são separados por
// assunto para o ADM revisar cada seção sem esbarrar na outra.
const mapa: Record<string, string> = {
  ...(elenco as Record<string, string>),
  ...(itens as Record<string, string>),
  ...(locais as Record<string, string>),
  ...(conteineres as Record<string, string>),
};

export function traduzirPt(chave: string): string | null {
  return mapa[chave] ?? null;
}
