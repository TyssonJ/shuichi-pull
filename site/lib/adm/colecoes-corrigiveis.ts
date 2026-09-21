import { listarPersonagens } from '@/lib/dados';
import { listarItens, listarLocais } from '@/lib/itens';
import { listarFaq } from '@/lib/faq';
import { cardsDeMecanica } from '@/lib/controles';
import type { Colecao } from '@/lib/correcoes-merge';

/** `longo`: o editor usa caixa de texto de várias linhas em vez de uma linha. */
export type CampoCorrigivel = { rotulo: string; caminho: string; longo?: boolean };

export const CAMPOS_POR_COLECAO: Record<Colecao, CampoCorrigivel[]> = {
  personagens: [
    { rotulo: 'Nome', caminho: 'nome' },
    { rotulo: 'Talento (PT)', caminho: 'talento.pt' },
    { rotulo: 'Talento (EN)', caminho: 'talento.en' },
    { rotulo: 'Descrição (PT)', caminho: 'descricao.pt', longo: true },
    { rotulo: 'Descrição (EN)', caminho: 'descricao.en', longo: true },
    { rotulo: 'Jogo de origem', caminho: 'jogo' },
    { rotulo: 'Sprite (URL)', caminho: 'sprite' },
    { rotulo: 'Personalidade', caminho: 'personalidade', longo: true },
    { rotulo: 'Aparência', caminho: 'aparencia', longo: true },
    { rotulo: 'História / passado', caminho: 'historia', longo: true },
    { rotulo: 'Segredo', caminho: 'segredo', longo: true },
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
    { rotulo: 'Descrição (PT)', caminho: 'descricao.pt', longo: true },
    { rotulo: 'Descrição (EN)', caminho: 'descricao.en', longo: true },
    { rotulo: 'Efeito (PT)', caminho: 'efeito.pt', longo: true },
    { rotulo: 'Efeito (EN)', caminho: 'efeito.en', longo: true },
    { rotulo: 'Ícone (URL)', caminho: 'icone' },
  ],
  locais: [
    { rotulo: 'Nome (PT)', caminho: 'nome.pt' },
    { rotulo: 'Nome (EN)', caminho: 'nome.en' },
  ],
  faq: [
    { rotulo: 'Pergunta', caminho: 'pergunta' },
    { rotulo: 'Resposta', caminho: 'resposta', longo: true },
  ],
  controles: [
    { rotulo: 'Título', caminho: 'titulo' },
    { rotulo: 'Texto', caminho: 'texto', longo: true },
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
