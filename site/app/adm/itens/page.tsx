import { repositorioCorrecoes } from '@/db/repositorios/correcoes';
import { CAMPOS_POR_COLECAO, registrosBase } from '@/lib/adm/colecoes-corrigiveis';
import { salvarCorrecaoAction, reverterCorrecaoAction } from '../correcoes-acoes';
import { EditorColecao } from '@/components/adm/EditorColecao';

export default async function AdmItens() {
  const correcoes = await repositorioCorrecoes.buscarCorrecoesPorColecao('itens');

  return (
    <div>
      <h1 className="mb-4 text-lg font-bold">Itens</h1>
      <EditorColecao
        registros={registrosBase('itens')}
        campos={CAMPOS_POR_COLECAO.itens}
        correcoes={correcoes}
        aoSalvar={salvarCorrecaoAction.bind(null, 'itens')}
        aoReverter={reverterCorrecaoAction.bind(null, 'itens')}
      />
    </div>
  );
}
