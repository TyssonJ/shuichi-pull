import { repositorioCorrecoes } from '@/db/repositorios/correcoes';
import { repositorioItensAdm } from '@/db/repositorios/itens-adm';
import { CAMPOS_POR_COLECAO, registrosBase } from '@/lib/adm/colecoes-corrigiveis';
import { listarItens } from '@/lib/itens';
import { listarItensComCorrecoes, listarLocaisComCorrecoes } from '@/lib/itens-corrigidos';
import { salvarCorrecaoAction, reverterCorrecaoAction } from '../correcoes-acoes';
import {
  criarItemAction, atualizarItemAction, excluirItemAction, restaurarItemAction,
} from './acoes';
import { EditorColecao } from '@/components/adm/EditorColecao';
import { GerenciarItens } from '@/components/adm/GerenciarItens';

export default async function AdmItens() {
  const [correcoes, itensAtivos, idsRemovidos, extras, locais] = await Promise.all([
    repositorioCorrecoes.buscarCorrecoesPorColecao('itens'),
    listarItensComCorrecoes(),
    repositorioItensAdm.listarRemovidos(),
    repositorioItensAdm.listarExtras(),
    listarLocaisComCorrecoes(),
  ]);

  const nomeDoGuia = new Map(listarItens().map((i) => [i.id, i.nome.pt]));
  const removidos = [...idsRemovidos].map((id) => ({ id, nome: nomeDoGuia.get(id) ?? id }));
  const locaisOpcao = locais.map((l) => ({
    id: l.id, nome: l.nome, andar: l.andar,
    conteineres: l.conteineres.map((c) => ({ fonteId: c.fonteId, nome: c.nome })),
  }));

  return (
    <div>
      <h1 className="mb-1 text-lg font-bold">Itens</h1>
      <p className="mb-4 text-sm text-neutral-400">
        Crie itens completos (receita, loja, onde aparecem no mapa), edite os que você criou e
        tire do site qualquer item — os do guia ficam só ocultos e dá pra restaurar.
      </p>

      <GerenciarItens
        itensAtivos={itensAtivos}
        idsExtras={extras.map((i) => i.id)}
        removidos={removidos}
        locais={locaisOpcao}
        aoCriar={criarItemAction}
        aoAtualizar={atualizarItemAction}
        aoExcluir={excluirItemAction}
        aoRestaurar={restaurarItemAction}
      />

      <h2 className="mb-1 font-bold">Corrigir campos do guia</h2>
      <p className="mb-3 text-sm text-neutral-400">
        Pra ajustar texto ou imagem de um item que já vem do guia, sem apagar o original.
      </p>
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
