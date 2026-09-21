import { repositorioCorrecoes } from '@/db/repositorios/correcoes';
import { repositorioItensAdm } from '@/db/repositorios/itens-adm';
import { camposDoEditor, camposParaMontar } from '@/lib/adm/campos-editor';
import { montarRegistrosDoGuia } from '@/lib/adm/montar-registros';
import { listarItens } from '@/lib/itens';
import { listarItensComCorrecoes, listarLocaisComCorrecoes } from '@/lib/itens-corrigidos';
import { salvarRegistroAction, reverterRegistroAction } from '../conteudo-acoes';
import {
  criarItemAction, atualizarItemAction, excluirItemAction, restaurarItemAction,
} from './acoes';
import { EditorConteudo } from '@/components/adm/EditorConteudo';
import { GerenciarItens } from '@/components/adm/GerenciarItens';

export default async function AdmItens({
  searchParams,
}: { searchParams: Promise<{ abrir?: string }> }) {
  const { abrir } = await searchParams;
  const [correcoes, itensAtivos, idsRemovidos, extras, locais] = await Promise.all([
    repositorioCorrecoes.buscarCorrecoesPorColecao('itens'),
    listarItensComCorrecoes(),
    repositorioItensAdm.listarRemovidos(),
    repositorioItensAdm.listarExtras(),
    listarLocaisComCorrecoes(),
  ]);

  const nomeDoGuia = new Map(listarItens().map((i) => [i.id, i.nome.pt]));
  const removidos = [...idsRemovidos].map((id) => ({ id, nome: nomeDoGuia.get(id) ?? id }));
  const registrosGuia = montarRegistrosDoGuia(
    listarItens().filter((i) => !idsRemovidos.has(i.id)),
    camposParaMontar('itens'), correcoes, 'nome.pt', 'categoria.pt',
  );
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

      <h2 className="mb-1 mt-8 font-bold">Editar os itens do guia</h2>
      <p className="mb-3 text-sm text-neutral-400">
        Nome, descrição, efeito e imagem de um item que já vem do guia. O original nunca é apagado,
        e &quot;ver na página&quot; abre o item como o público vê.
      </p>
      <EditorConteudo
        colecao="itens"
        abertoInicial={abrir ?? null}
        singular="item"
        campos={camposDoEditor('itens')}
        registros={registrosGuia}
        preview="nenhum"
        aoSalvar={salvarRegistroAction.bind(null, 'itens')}
        aoReverter={reverterRegistroAction.bind(null, 'itens')}
      />
    </div>
  );
}
