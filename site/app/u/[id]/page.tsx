import { notFound } from 'next/navigation';
import Link from 'next/link';
import { repositorioUsuarios } from '@/db/repositorios/usuarios';
import { repositorioPartidas } from '@/db/repositorios/partidas';
import { listarPersonagens } from '@/lib/dados';
import { PainelComTrilhas } from '@/components/layout/PainelComTrilhas';

function formatarData(d: Date): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const usuario = await repositorioUsuarios.buscar(id);
  return { title: usuario ? `${usuario.discordNome} — Shuichi Pull` : 'Perfil não encontrado — Shuichi Pull' };
}

export default async function PerfilPublico({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const usuario = await repositorioUsuarios.buscar(id);
  if (!usuario) notFound();

  const [historico, personagens] = await Promise.all([
    repositorioPartidas.historicoDoUsuario(id),
    Promise.resolve(listarPersonagens()),
  ]);
  const porId = new Map(personagens.map((p) => [p.id, p]));
  const mains = usuario.mains.map((mid) => porId.get(mid)).filter((p) => p !== undefined);

  return (
    <PainelComTrilhas as="article">
      <div className="flex items-center gap-3">
        {usuario.discordAvatar && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={usuario.discordAvatar}
            alt=""
            className="h-16 w-16 rounded-full border-2 border-alter-green"
          />
        )}
        <div>
          <h1 className="text-3xl font-black leading-none tracking-tight text-[#F2F2F5]">
            {usuario.discordNome}
          </h1>
          <p className="mt-1 font-mono text-[8px] tracking-[.1em] text-dim">
            NO ARQUIVO DESDE {formatarData(usuario.criadoEm)}
          </p>
        </div>
      </div>

      {mains.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 font-mono text-[9px] tracking-[.14em] text-dim">MAINS</h2>
          <ul className="flex flex-wrap gap-2">
            {mains.map((p) => (
              <li key={p!.id}>
                <Link
                  href={`/elenco/${p!.id}/`}
                  className="flex items-center gap-1.5 rounded-[3px] border border-line bg-sur px-2 py-1 hover:border-alter-green"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p!.sprite} alt="" className="h-6 w-6 object-contain" />
                  <span className="text-[11px] text-[#D6D6E0]">{p!.nome}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6">
        <h2 className="mb-2 font-mono text-[9px] tracking-[.14em] text-dim">
          ÚLTIMAS PARTIDAS
        </h2>
        {historico.length === 0 ? (
          <p className="text-[11px] text-dim">Nenhuma partida finalizada ainda.</p>
        ) : (
          <ul className="space-y-1.5">
            {historico.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/partidas/${p.id}/`}
                  className="flex items-baseline gap-2 rounded-[3px] border border-line bg-sur px-2 py-1.5 text-[12px] text-[#D6D6E0] hover:border-cyber-cyan"
                >
                  <span className="font-bold">{p.titulo}</span>
                  <span className="ml-auto font-mono text-[9px] text-dim">
                    {formatarData(p.dataHora)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </PainelComTrilhas>
  );
}
