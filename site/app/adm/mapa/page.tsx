import { repositorioCorrecoes } from '@/db/repositorios/correcoes';
import { listarLocais } from '@/lib/itens';
import { camposDoEditor, camposParaMontar } from '@/lib/adm/campos-editor';
import { montarRegistrosDoGuia } from '@/lib/adm/montar-registros';
import { EditorConteudo } from '@/components/adm/EditorConteudo';
import { salvarRegistroAction, reverterRegistroAction } from '../conteudo-acoes';

export default async function AdmMapa({
  searchParams,
}: { searchParams: Promise<{ abrir?: string }> }) {
  const { abrir } = await searchParams;
  const correcoes = await repositorioCorrecoes.buscarCorrecoesPorColecao('locais');

  return (
    <div>
      <h1 className="mb-1 text-lg font-bold">Mapa</h1>
      <p className="mb-4 text-sm text-neutral-400">Nomes dos locais da academia. Use &quot;ver na página&quot; pra conferir como ficou.</p>
      <EditorConteudo
        colecao="locais"
        abertoInicial={abrir ?? null}
        singular="local"
        campos={camposDoEditor('locais')}
        registros={montarRegistrosDoGuia(listarLocais(), camposParaMontar('locais'), correcoes, 'nome.pt')}
        preview="nenhum"
        aoSalvar={salvarRegistroAction.bind(null, 'locais')}
        aoReverter={reverterRegistroAction.bind(null, 'locais')}
      />
    </div>
  );
}
