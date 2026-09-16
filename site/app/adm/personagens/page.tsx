import { repositorioCorrecoes } from '@/db/repositorios/correcoes';
import { repositorioPersonagensAdm } from '@/db/repositorios/personagens-adm';
import { CAMPOS_POR_COLECAO, registrosBase } from '@/lib/adm/colecoes-corrigiveis';
import { listarPersonagensComCorrecoes } from '@/lib/dados-corrigidos';
import { salvarCorrecaoAction, reverterCorrecaoAction } from '../correcoes-acoes';
import { criarPersonagemAction, excluirPersonagemAction, restaurarPersonagemAction } from './acoes';
import { EditorColecao } from '@/components/adm/EditorColecao';
import { GerenciarPersonagens } from '@/components/adm/GerenciarPersonagens';

export default async function AdmPersonagens() {
  const [correcoes, personagensAtivos, idsRemovidos] = await Promise.all([
    repositorioCorrecoes.buscarCorrecoesPorColecao('personagens'),
    listarPersonagensComCorrecoes(),
    repositorioPersonagensAdm.listarRemovidos(),
  ]);

  return (
    <div>
      <h1 className="mb-4 text-lg font-bold">Personagens</h1>

      <GerenciarPersonagens
        personagensAtivos={personagensAtivos}
        idsRemovidos={[...idsRemovidos]}
        aoCriar={criarPersonagemAction}
        aoExcluir={excluirPersonagemAction}
        aoRestaurar={restaurarPersonagemAction}
      />

      <h2 className="mb-3 font-bold">Corrigir campos do guidebook</h2>
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
