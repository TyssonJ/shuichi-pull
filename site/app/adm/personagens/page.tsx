import { repositorioCorrecoes } from '@/db/repositorios/correcoes';
import { repositorioPersonagensAdm } from '@/db/repositorios/personagens-adm';
import { camposDoEditor, camposParaMontar } from '@/lib/adm/campos-editor';
import { montarRegistrosDoGuia } from '@/lib/adm/montar-registros';
import { listarPersonagens } from '@/lib/dados';
import { listarPersonagensComCorrecoes } from '@/lib/dados-corrigidos';
import { salvarRegistroAction, reverterRegistroAction } from '../conteudo-acoes';
import {
  criarPersonagemAction, atualizarPersonagemAction, excluirPersonagemAction, restaurarPersonagemAction,
} from './acoes';
import { EditorConteudo } from '@/components/adm/EditorConteudo';
import { GerenciarPersonagens } from '@/components/adm/GerenciarPersonagens';

export default async function AdmPersonagens({
  searchParams,
}: { searchParams: Promise<{ abrir?: string }> }) {
  const { abrir } = await searchParams;
  const [correcoes, personagensAtivos, idsRemovidos, extras] = await Promise.all([
    repositorioCorrecoes.buscarCorrecoesPorColecao('personagens'),
    listarPersonagensComCorrecoes(),
    repositorioPersonagensAdm.listarRemovidos(),
    repositorioPersonagensAdm.listarExtras(),
  ]);

  const nomeDoGuia = new Map(listarPersonagens().map((p) => [p.id, p.nome]));
  const removidos = [...idsRemovidos].map((id) => ({ id, nome: nomeDoGuia.get(id) ?? id }));
  const registrosGuia = montarRegistrosDoGuia(
    listarPersonagens().filter((p) => !idsRemovidos.has(p.id)),
    camposParaMontar('personagens'), correcoes, 'nome', 'jogo',
  );

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

      <h2 className="mb-1 mt-8 font-bold">Editar os personagens do guia</h2>
      <p className="mb-3 text-sm text-neutral-400">
        Personalidade, aparência, história, segredo e os demais textos de quem já vem do guia —
        a prévia mostra a ficha como aparece no site, e o original nunca é apagado.
      </p>
      <EditorConteudo
        colecao="personagens"
        abertoInicial={abrir ?? null}
        singular="personagem"
        campos={camposDoEditor('personagens')}
        registros={registrosGuia}
        preview="personagem"
        aoSalvar={salvarRegistroAction.bind(null, 'personagens')}
        aoReverter={reverterRegistroAction.bind(null, 'personagens')}
      />
    </div>
  );
}
