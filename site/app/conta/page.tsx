import { auth, signIn, signOut } from '@/auth';
import { repositorioUsuarios } from '@/db/repositorios/usuarios';
import { listarPersonagens } from '@/lib/dados';
import { PainelComTrilhas } from '@/components/layout/PainelComTrilhas';
import { PerfilForm } from '@/components/conta/PerfilForm';
import { atualizarPerfilAction } from './acoes';

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
  const personagens = listarPersonagens().map((p) => ({ id: p.id, nome: p.nome }));

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
        </div>
      </div>

      <PerfilForm
        uuidInicial={usuario?.uuidGmod ?? ''}
        mainsIniciais={usuario?.mains ?? []}
        personagens={personagens}
        aoSalvar={atualizarPerfilAction}
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
