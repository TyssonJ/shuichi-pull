import { repositorioCorrecoes } from '@/db/repositorios/correcoes';
import { repositorioPersonagensAdm } from '@/db/repositorios/personagens-adm';
import { CAMPOS_POR_COLECAO, registrosBase } from '@/lib/adm/colecoes-corrigiveis';
import { listarPersonagens } from '@/lib/dados';
import { listarPersonagensComCorrecoes } from '@/lib/dados-corrigidos';
import { salvarCorrecaoAction, reverterCorrecaoAction } from '../correcoes-acoes';
import {
  criarPersonagemAction, atualizarPersonagemAction, excluirPersonagemAction, restaurarPersonagemAction,
} from './acoes';
import { EditorColecao } from '@/components/adm/EditorColecao';
import { GerenciarPersonagens } from '@/components/adm/GerenciarPersonagens';

export default async function AdmPersonagens() {
  const [correcoes, personagensAtivos, idsRemovidos, extras] = await Promise.all([
    repositorioCorrecoes.buscarCorrecoesPorColecao('personagens'),
    listarPersonagensComCorrecoes(),
    repositorioPersonagensAdm.listarRemovidos(),
    repositorioPersonagensAdm.listarExtras(),
  ]);

  const nomeDoGuia = new Map(listarPersonagens().map((p) => [p.id, p.nome]));
  const removidos = [...idsRemovidos].map((id) => ({ id, nome: nomeDoGuia.get(id) ?? id }));

  return (
    <div>
      <h1 className="mb-1 text-lg font-bold">Personagens</h1>
      <p className="mb-4 text-sm text-neutral-400">
        Crie personagens completos (atributos, etiquetas, perfil), edite os que você criou e
        tire do site qualquer personagem — os do guia ficam só ocultos e dá pra restaurar.
        Quem entra ou sai aqui muda também o grid de seleção das partidas.
      </p>

      <GerenciarPersonagens
        personagensAtivos={personagensAtivos}
        idsExtras={extras.map((p) => p.id)}
        removidos={removidos}
        aoCriar={criarPersonagemAction}
        aoAtualizar={atualizarPersonagemAction}
        aoExcluir={excluirPersonagemAction}
        aoRestaurar={restaurarPersonagemAction}
      />

      <h2 className="mb-1 font-bold">Corrigir campos do guia</h2>
      <p className="mb-3 text-sm text-neutral-400">
        Pra ajustar texto ou sprite de um personagem que já vem do guia, sem apagar o original.
      </p>
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
