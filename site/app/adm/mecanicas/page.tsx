import { repositorioCorrecoes } from '@/db/repositorios/correcoes';
import { CAMPOS_POR_COLECAO, registrosBase } from '@/lib/adm/colecoes-corrigiveis';
import { salvarCorrecaoAction, reverterCorrecaoAction } from '../correcoes-acoes';
import { EditorColecao } from '@/components/adm/EditorColecao';

export default async function AdmMecanicas() {
  const correcoes = await repositorioCorrecoes.buscarCorrecoesPorColecao('controles');

  return (
    <div>
      <h1 className="mb-4 text-lg font-bold">Mecânicas</h1>
      <EditorColecao
        registros={registrosBase('controles')}
        campos={CAMPOS_POR_COLECAO.controles}
        correcoes={correcoes}
        aoSalvar={salvarCorrecaoAction.bind(null, 'controles')}
        aoReverter={reverterCorrecaoAction.bind(null, 'controles')}
      />
    </div>
  );
}
