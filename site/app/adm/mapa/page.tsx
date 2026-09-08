import { repositorioCorrecoes } from '@/db/repositorios/correcoes';
import { CAMPOS_POR_COLECAO, registrosBase } from '@/lib/adm/colecoes-corrigiveis';
import { salvarCorrecaoAction, reverterCorrecaoAction } from '../correcoes-acoes';
import { EditorColecao } from '@/components/adm/EditorColecao';

export default async function AdmMapa() {
  const correcoes = await repositorioCorrecoes.buscarCorrecoesPorColecao('locais');

  return (
    <div>
      <h1 className="mb-4 text-lg font-bold">Mapa</h1>
      <EditorColecao
        registros={registrosBase('locais')}
        campos={CAMPOS_POR_COLECAO.locais}
        correcoes={correcoes}
        aoSalvar={(args) => salvarCorrecaoAction({ colecao: 'locais', ...args })}
        aoReverter={(args) => reverterCorrecaoAction({ colecao: 'locais', ...args })}
      />
    </div>
  );
}
