import { repositorioCargos } from '@/db/repositorios/cargos';
import { repositorioUsuarios } from '@/db/repositorios/usuarios';
import { identidadeDe } from '@/lib/identidade';
import { GerenciarCargos } from '@/components/adm/GerenciarCargos';
import {
  criarCargoAction, atualizarCargoAction, excluirCargoAction, concederCargoAction, retirarCargoAction,
} from './acoes';

export default async function AdmCargos() {
  const [cargos, portadores, usuarios] = await Promise.all([
    repositorioCargos.listar(),
    repositorioCargos.todosOsPortadores(),
    repositorioUsuarios.listarTodos(),
  ]);

  // O painel mostra o NOME REAL do Discord (com o apelido entre parênteses): quem modera precisa saber quem é quem.
  const nomes = new Map(usuarios.map((u) => {
    const i = identidadeDe(u);
    return [u.discordId, i.nomeOriginal ? `${u.discordNome} (${i.nome})` : u.discordNome] as const;
  }));

  return (
    <div>
      <h1 className="mb-1 text-lg font-bold">Cargos</h1>
      <p className="mb-4 text-sm text-neutral-400">
        Crie cargos com nome e cor (tipo o &quot;Calouro&quot;) e entregue a jogadores específicos. O selo aparece no perfil da
        pessoa e o texto ajusta sozinho pra ficar legível em qualquer cor.
      </p>
      <GerenciarCargos
        cargos={cargos.map((c) => ({
          id: c.id, nome: c.nome, cor: c.cor,
          portadores: portadores.filter((p) => p.cargoId === c.id).map((p) => ({ discordId: p.discordId, nome: nomes.get(p.discordId) ?? p.discordId })),
        }))}
        usuarios={usuarios.map((u) => ({ discordId: u.discordId, nome: nomes.get(u.discordId) ?? u.discordNome }))}
        aoCriar={criarCargoAction}
        aoAtualizar={atualizarCargoAction}
        aoExcluir={excluirCargoAction}
        aoConceder={concederCargoAction}
        aoRetirar={retirarCargoAction}
      />
    </div>
  );
}
