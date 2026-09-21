import { repositorioCorrecoes } from '@/db/repositorios/correcoes';
import { repositorioConteudoAdm } from '@/db/repositorios/conteudo-adm';
import { listarFaq } from '@/lib/faq';
import { camposDoEditor, camposParaMontar } from '@/lib/adm/campos-editor';
import { montarRegistrosDoGuia, montarRegistrosNovos } from '@/lib/adm/montar-registros';
import { EditorConteudo } from '@/components/adm/EditorConteudo';
import {
  salvarRegistroAction, reverterRegistroAction, criarConteudoAction, excluirConteudoAction, restaurarConteudoAction,
} from '../conteudo-acoes';

export default async function AdmFaq() {
  const [correcoes, extras, idsRemovidos] = await Promise.all([
    repositorioCorrecoes.buscarCorrecoesPorColecao('faq'),
    repositorioConteudoAdm.listarExtras('faq'),
    repositorioConteudoAdm.listarRemovidos('faq'),
  ]);

  const guia = listarFaq();
  const registros = [
    ...montarRegistrosDoGuia(guia.filter((p) => !idsRemovidos.has(p.id)), camposParaMontar('faq'), correcoes, 'pergunta', 'secao'),
    ...montarRegistrosNovos('faq', extras, 'pergunta', 'secao'),
  ];
  const removidos = guia.filter((p) => idsRemovidos.has(p.id)).map((p) => ({ id: p.id, titulo: p.pergunta }));
  const secoes = [...new Set(registros.map((r) => r.grupo).filter((g): g is string => Boolean(g)))];

  return (
    <div>
      <h1 className="mb-1 text-lg font-bold">FAQ</h1>
      <p className="mb-4 text-sm text-neutral-400">
        Crie perguntas novas, corrija as existentes e tire do site as que não servem mais — a prévia
        mostra a pergunta como ela aparece na página. As do guia ficam só escondidas e dá pra restaurar.
      </p>
      <EditorConteudo
        colecao="faq"
        singular="pergunta"
        campos={camposDoEditor('faq')}
        registros={registros}
        removidos={removidos}
        preview="faq"
        gruposExistentes={secoes}
        aoSalvar={salvarRegistroAction.bind(null, 'faq')}
        aoReverter={reverterRegistroAction.bind(null, 'faq')}
        aoCriar={criarConteudoAction.bind(null, 'faq')}
        aoExcluir={excluirConteudoAction.bind(null, 'faq')}
        aoRestaurar={restaurarConteudoAction.bind(null, 'faq')}
      />
    </div>
  );
}
