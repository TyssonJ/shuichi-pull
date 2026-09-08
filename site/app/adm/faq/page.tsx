import { repositorioCorrecoes } from '@/db/repositorios/correcoes';
import { CAMPOS_POR_COLECAO, registrosBase } from '@/lib/adm/colecoes-corrigiveis';
import { salvarCorrecaoAction, reverterCorrecaoAction } from '../correcoes-acoes';
import { EditorColecao } from '@/components/adm/EditorColecao';

export default async function AdmFaq() {
  const correcoes = await repositorioCorrecoes.buscarCorrecoesPorColecao('faq');

  return (
    <div>
      <h1 className="mb-4 text-lg font-bold">Textos (FAQ)</h1>
      <EditorColecao
        registros={registrosBase('faq')}
        campos={CAMPOS_POR_COLECAO.faq}
        correcoes={correcoes}
        aoSalvar={(args) => salvarCorrecaoAction({ colecao: 'faq', ...args })}
        aoReverter={(args) => reverterCorrecaoAction({ colecao: 'faq', ...args })}
      />
    </div>
  );
}
