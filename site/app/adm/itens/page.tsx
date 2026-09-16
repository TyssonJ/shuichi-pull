import { repositorioCorrecoes } from '@/db/repositorios/correcoes';
import { repositorioItensAdm } from '@/db/repositorios/itens-adm';
import { CAMPOS_POR_COLECAO, registrosBase } from '@/lib/adm/colecoes-corrigiveis';
import { listarItensComCorrecoes } from '@/lib/itens-corrigidos';
import { salvarCorrecaoAction, reverterCorrecaoAction } from '../correcoes-acoes';
import { criarItemAction, excluirItemAction, restaurarItemAction } from './acoes';
import { EditorColecao } from '@/components/adm/EditorColecao';
import { GerenciarItens } from '@/components/adm/GerenciarItens';

export default async function AdmItens() {
  const [correcoes, itensAtivos, idsRemovidos] = await Promise.all([
    repositorioCorrecoes.buscarCorrecoesPorColecao('itens'),
    listarItensComCorrecoes(),
    repositorioItensAdm.listarRemovidos(),
  ]);

  return (
    <div>
      <h1 className="mb-4 text-lg font-bold">Itens</h1>

      <GerenciarItens
        itensAtivos={itensAtivos}
        idsRemovidos={[...idsRemovidos]}
        aoCriar={criarItemAction}
        aoExcluir={excluirItemAction}
        aoRestaurar={restaurarItemAction}
      />

      <h2 className="mb-3 font-bold">Corrigir campos do guidebook</h2>
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
