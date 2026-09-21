import { repositorioCorrecoes } from '@/db/repositorios/correcoes';
import { repositorioConteudoAdm } from '@/db/repositorios/conteudo-adm';
import { cardsDeMecanica } from '@/lib/controles';
import { camposDoEditor, camposParaMontar } from '@/lib/adm/campos-editor';
import { montarRegistrosDoGuia, montarRegistrosNovos } from '@/lib/adm/montar-registros';
import { EditorConteudo } from '@/components/adm/EditorConteudo';
import {
  salvarRegistroAction, reverterRegistroAction, criarConteudoAction, excluirConteudoAction, restaurarConteudoAction,
} from '../conteudo-acoes';

export default async function AdmMecanicas() {
  const [correcoes, extras, idsRemovidos] = await Promise.all([
    repositorioCorrecoes.buscarCorrecoesPorColecao('controles'),
    repositorioConteudoAdm.listarExtras('controles'),
    repositorioConteudoAdm.listarRemovidos('controles'),
  ]);

  const guia = cardsDeMecanica();
  const registros = [
    ...montarRegistrosDoGuia(guia.filter((c) => !idsRemovidos.has(c.id)), camposParaMontar('controles'), correcoes, 'titulo', 'grupo'),
    ...montarRegistrosNovos('controles', extras, 'titulo', 'grupo'),
  ];
  const removidos = guia.filter((c) => idsRemovidos.has(c.id)).map((c) => ({ id: c.id, titulo: c.titulo }));
  const grupos = [...new Set(registros.map((r) => r.grupo).filter((g): g is string => Boolean(g)))];

  return (
    <div>
      <h1 className="mb-1 text-lg font-bold">Mecânicas</h1>
      <p className="mb-4 text-sm text-neutral-400">
        Cards de mecânica do jogo: crie novos, corrija os existentes ou tire do site os desatualizados.
        A prévia mostra o card como aparece em /mecanicas.
      </p>
      <EditorConteudo
        colecao="controles"
        singular="card"
        campos={camposDoEditor('controles')}
        registros={registros}
        removidos={removidos}
        preview="mecanica"
        gruposExistentes={grupos}
        aoSalvar={salvarRegistroAction.bind(null, 'controles')}
        aoReverter={reverterRegistroAction.bind(null, 'controles')}
        aoCriar={criarConteudoAction.bind(null, 'controles')}
        aoExcluir={excluirConteudoAction.bind(null, 'controles')}
        aoRestaurar={restaurarConteudoAction.bind(null, 'controles')}
      />
    </div>
  );
}
