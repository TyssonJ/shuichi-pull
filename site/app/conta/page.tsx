import { auth, signIn, signOut } from '@/auth';
import { repositorioUsuarios } from '@/db/repositorios/usuarios';
import { listarPersonagensComCorrecoes } from '@/lib/dados-corrigidos';
import { PainelComTrilhas } from '@/components/layout/PainelComTrilhas';
import { PerfilForm } from '@/components/conta/PerfilForm';
import { PersonalizarPerfil } from '@/components/conta/PersonalizarPerfil';
import { EstiloDoPerfil } from '@/components/conta/EstiloDoPerfil';
import { repositorioPerfilEstilos } from '@/db/repositorios/perfil-estilos';
import { ESTILO_VAZIO } from '@/lib/estilo-perfil';
import { bannerDoRegistro } from '@/lib/perfil-visual';
import { spriteInteiroDoPersonagem } from '@/lib/sprites';
import { formatarDataBR } from '@/lib/fuso';
import { repositorioPartidas } from '@/db/repositorios/partidas';
import { tituloPorPartidas } from '@/lib/titulos';
import { atualizarPerfilAction, salvarPersonalizacaoAction } from './acoes';
import { enviarEstiloAction, cancelarPedidoEstiloAction } from './estilo-acoes';

export const metadata = { title: 'Minha conta — Shuichi Pull' };

export default async function PaginaConta() {
  const sessao = await auth();

  if (!sessao?.user?.discordId) {
    return (
      <PainelComTrilhas>
        <p className="font-mono text-[8px] tracking-[.2em] text-dim">CONTA</p>
        <h1 className="mb-3 text-4xl font-black tracking-tight text-[#F2F2F5]">
          ENTRAR
        </h1>
        <p className="mb-6 max-w-md text-[12px] leading-relaxed text-dim">
          Entre com sua conta do Discord pra guardar seu UUID do Garry&apos;s Mod
          e marcar seus mains. Mais pra frente, essa conta também vai poder
          organizar partida e puxar histórico de sessões.
        </p>
        <form
          action={async () => {
            'use server';
            await signIn('discord', { redirectTo: '/conta' });
          }}
        >
          <button
            type="submit"
            className="rounded-[3px] border-2 border-alter-green bg-ego-escuro px-4 py-2 font-mono text-[11px] tracking-[.1em] text-[#D6D6E0] hover:bg-alter-green hover:text-[#08090D]"
          >
            Entrar com Discord
          </button>
        </form>
      </PainelComTrilhas>
    );
  }

  await repositorioUsuarios.garantir(
    sessao.user.discordId,
    sessao.user.name ?? 'Sem nome',
    sessao.user.image ?? null,
  );
  const usuario = await repositorioUsuarios.buscar(sessao.user.discordId);
  const elenco = await listarPersonagensComCorrecoes();
  const personagens = elenco.map((p) => ({ id: p.id, nome: p.nome }));
  const bannersDePersonagem = elenco.map((p) => ({
    id: p.id, nome: p.nome, sprite: spriteInteiroDoPersonagem(p.id) ?? p.sprite, retrato: p.sprite,
  }));
  const { estatisticas } = await repositorioPartidas.perfilDoUsuario(sessao.user.discordId);
  const estilo = await repositorioPerfilEstilos.buscar(sessao.user.discordId);

  return (
    <PainelComTrilhas>
      <p className="font-mono text-[8px] tracking-[.2em] text-dim">CONTA</p>
      <div className="flex items-center gap-3">
        {sessao.user.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={sessao.user.image}
            alt=""
            className="h-14 w-14 rounded-full border-2 border-alter-green"
          />
        )}
        <div>
          <h1 className="text-3xl font-black leading-none tracking-tight text-[#F2F2F5]">
            {sessao.user.name}
          </h1>
          {sessao.user.papel && (
            <p className="mt-1 font-mono text-[8px] uppercase tracking-[.1em] text-alter-green">
              {sessao.user.papel}
            </p>
          )}
          <a
            href={`/u/${sessao.user.discordId}/`}
            className="mt-1 inline-block font-mono text-[9px] text-cyber-cyan hover:underline"
          >
            ver perfil público →
          </a>
        </div>
      </div>

      <PerfilForm
        uuidInicial={usuario?.uuidGmod ?? ''}
        mainsIniciais={usuario?.mains ?? []}
        personagens={personagens}
        aoSalvar={atualizarPerfilAction}
      />

      <PersonalizarPerfil
        nome={sessao.user.name ?? 'Sem nome'}
        avatar={sessao.user.image ?? null}
        apelidoInicial={usuario?.apelido ?? ''}
        avatarInicial={{
          tipo: usuario?.avatarTipo === 'personagem' || usuario?.avatarTipo === 'url' ? usuario.avatarTipo : 'discord',
          valor: usuario?.avatarValor ?? '',
        }}
        desde={usuario ? formatarDataBR(usuario.criadoEm, true) : ''}
        titulo={tituloPorPartidas(estatisticas.total)}
        bioInicial={usuario?.bio ?? ''}
        bannerInicial={bannerDoRegistro(usuario?.bannerTipo ?? null, usuario?.bannerValor ?? null, new Set(elenco.map((p) => p.id)))}
        personagens={bannersDePersonagem}
        aoSalvar={salvarPersonalizacaoAction}
      />

      <EstiloDoPerfil
        inicial={estilo?.pendente ?? estilo?.publicado ?? ESTILO_VAZIO}
        estado={{
          status: estilo?.status === 'pendente' || estilo?.status === 'rejeitado' ? estilo.status : 'nenhum',
          motivo: estilo?.motivoRejeicao ?? null,
          temPublicado: Boolean(estilo?.publicado),
        }}
        souAdm={Boolean(sessao.user.papel)}
        nome={sessao.user.name ?? 'Sem nome'}
        aoEnviar={enviarEstiloAction}
        aoCancelar={cancelarPedidoEstiloAction}
      />

      <form
        action={async () => {
          'use server';
          await signOut({ redirectTo: '/' });
        }}
        className="mt-8 border-t border-line pt-4"
      >
        <button type="submit" className="font-mono text-[9px] text-dim hover:text-alerta">
          Sair da conta
        </button>
      </form>
    </PainelComTrilhas>
  );
}
