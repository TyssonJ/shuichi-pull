import { repositorioConquistas } from '@/db/repositorios/conquistas';
import { repositorioUsuarios } from '@/db/repositorios/usuarios';
import { identidadeDe } from '@/lib/identidade';
import { GerenciarConquistas } from '@/components/adm/GerenciarConquistas';
import {
  criarConquistaAction, atualizarConquistaAction, excluirConquistaAction, concederConquistaAction, retirarConquistaAction,
} from './acoes';

export default async function AdmConquistas() {
  const [conquistas, portadores, usuarios] = await Promise.all([
    repositorioConquistas.listar(),
    repositorioConquistas.todosOsPortadores(),
    repositorioUsuarios.listarTodos(),
  ]);

  const nomes = new Map(usuarios.map((u) => {
    const i = identidadeDe(u);
    return [u.discordId, i.nomeOriginal ? `${u.discordNome} (${i.nome})` : u.discordNome] as const;
  }));

  return (
    <div>
      <h1 className="mb-1 text-lg font-bold">Conquistas</h1>
      <p className="mb-4 text-sm text-neutral-400">
        Cada conquista tem um ícone quadrado, um nome e uma descrição curta; a completa abre quando a pessoa clica nela no
        perfil. Você entrega e retira quando quiser.
      </p>
      <GerenciarConquistas
        conquistas={conquistas.map((c) => ({
          id: c.id, nome: c.nome, descricaoCurta: c.descricaoCurta, descricaoLonga: c.descricaoLonga, iconeUrl: c.iconeUrl,
          portadores: portadores.filter((p) => p.conquistaId === c.id).map((p) => ({ discordId: p.discordId, nome: nomes.get(p.discordId) ?? p.discordId })),
        }))}
        usuarios={usuarios.map((u) => ({ discordId: u.discordId, nome: nomes.get(u.discordId) ?? u.discordNome }))}
        aoCriar={criarConquistaAction}
        aoAtualizar={atualizarConquistaAction}
        aoExcluir={excluirConquistaAction}
        aoConceder={concederConquistaAction}
        aoRetirar={retirarConquistaAction}
      />
    </div>
  );
}
