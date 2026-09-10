import { repositorioCorrecoes } from '@/db/repositorios/correcoes';
import { CAMPOS_POR_COLECAO, registrosBase } from '@/lib/adm/colecoes-corrigiveis';
import { salvarCorrecaoAction, reverterCorrecaoAction } from '../correcoes-acoes';
import { EditorColecao } from '@/components/adm/EditorColecao';

export default async function AdmPersonagens() {
  const correcoes = await repositorioCorrecoes.buscarCorrecoesPorColecao('personagens');

  return (
    <div>
      <h1 className="mb-4 text-lg font-bold">Personagens</h1>
      <EditorColecao
        registros={registrosBase('personagens')}
        campos={CAMPOS_POR_COLECAO.personagens}
        correcoes={correcoes}
        aoSalvar={salvarCorrecaoAction.bind(null, 'personagens')}
        aoReverter={reverterCorrecaoAction.bind(null, 'personagens')}
      />
    </div>
  );
}
