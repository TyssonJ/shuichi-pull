import { repositorioPerfilEstilos } from '@/db/repositorios/perfil-estilos';
import { repositorioUsuarios } from '@/db/repositorios/usuarios';
import { identidadeDe } from '@/lib/identidade';
import { formatarDataBR } from '@/lib/fuso';
import { FilaDePerfis, type PedidoDePerfil } from '@/components/adm/FilaDePerfis';
import { aprovarEstiloAction, rejeitarEstiloAction, removerEstiloPublicadoAction } from './acoes';

export default async function AdmPerfis() {
  const [pendentes, publicados, usuarios] = await Promise.all([
    repositorioPerfilEstilos.listarPendentes(),
    repositorioPerfilEstilos.listarPublicados(),
    repositorioUsuarios.listarTodos(),
  ]);

  const nomes = new Map(usuarios.map((u) => {
    const i = identidadeDe(u);
    return [u.discordId, i.nomeOriginal ? `${u.discordNome} (${i.nome})` : u.discordNome] as const;
  }));
  const nome = (id: string) => nomes.get(id) ?? id;

  const pedidos: PedidoDePerfil[] = pendentes.flatMap((l) =>
    l.pendente ? [{ discordId: l.discordId, nome: nome(l.discordId), estilo: l.pendente, quando: l.enviadoEm ? formatarDataBR(l.enviadoEm, true) : '' }] : [],
  );
  const noAr: PedidoDePerfil[] = publicados.flatMap((l) =>
    l.publicado ? [{ discordId: l.discordId, nome: nome(l.discordId), estilo: l.publicado, quando: '' }] : [],
  );

  return (
    <div>
      <h1 className="mb-1 text-lg font-bold">Perfis</h1>
      <p className="mb-4 text-sm text-neutral-400">
        Cor de tema, fundo lateral e emojis do perfil só aparecem pra todo mundo depois que você aprova. Confira as imagens
        (clique pra abrir no tamanho real) e recuse com um motivo se tiver algo impróprio — a pessoa vê o motivo e pode ajustar.
      </p>
      <FilaDePerfis
        pedidos={pedidos}
        publicados={noAr}
        aoAprovar={aprovarEstiloAction}
        aoRejeitar={rejeitarEstiloAction}
        aoRemover={removerEstiloPublicadoAction}
      />
    </div>
  );
}
