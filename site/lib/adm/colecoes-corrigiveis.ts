import { listarPersonagens } from '@/lib/dados';
import { listarItens, listarLocais } from '@/lib/itens';
import { listarFaq } from '@/lib/faq';
import { cardsDeMecanica } from '@/lib/controles';
import type { Colecao } from '@/lib/correcoes-merge';

export type CampoCorrigivel = { rotulo: string; caminho: string };

export const CAMPOS_POR_COLECAO: Record<Colecao, CampoCorrigivel[]> = {
  personagens: [
    { rotulo: 'Nome', caminho: 'nome' },
    { rotulo: 'Talento (PT)', caminho: 'talento.pt' },
    { rotulo: 'Talento (EN)', caminho: 'talento.en' },
    { rotulo: 'Descrição (PT)', caminho: 'descricao.pt' },
    { rotulo: 'Descrição (EN)', caminho: 'descricao.en' },
    { rotulo: 'Jogo de origem', caminho: 'jogo' },
  ],
  itens: [
    { rotulo: 'Nome (PT)', caminho: 'nome.pt' },
    { rotulo: 'Nome (EN)', caminho: 'nome.en' },
    { rotulo: 'Categoria (PT)', caminho: 'categoria.pt' },
    { rotulo: 'Categoria (EN)', caminho: 'categoria.en' },
    { rotulo: 'Ramo (PT)', caminho: 'ramo.pt' },
    { rotulo: 'Ramo (EN)', caminho: 'ramo.en' },
    { rotulo: 'Raridade (PT)', caminho: 'raridade.pt' },
    { rotulo: 'Raridade (EN)', caminho: 'raridade.en' },
    { rotulo: 'Descrição (PT)', caminho: 'descricao.pt' },
    { rotulo: 'Descrição (EN)', caminho: 'descricao.en' },
    { rotulo: 'Efeito (PT)', caminho: 'efeito.pt' },
    { rotulo: 'Efeito (EN)', caminho: 'efeito.en' },
  ],
  locais: [
    { rotulo: 'Nome (PT)', caminho: 'nome.pt' },
    { rotulo: 'Nome (EN)', caminho: 'nome.en' },
  ],
  faq: [
    { rotulo: 'Pergunta', caminho: 'pergunta' },
    { rotulo: 'Resposta', caminho: 'resposta' },
  ],
  controles: [
    { rotulo: 'Título', caminho: 'titulo' },
    { rotulo: 'Texto', caminho: 'texto' },
  ],
};

export function registrosBase(colecao: Colecao): { id: string }[] {
  switch (colecao) {
    case 'personagens': return listarPersonagens();
    case 'itens': return listarItens();
    case 'locais': return listarLocais();
    case 'faq': return listarFaq();
    case 'controles': return cardsDeMecanica();
  }
}
