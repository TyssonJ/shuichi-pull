import Link from 'next/link';
import { auth } from '@/auth';
import { repositorioPartidas } from '@/db/repositorios/partidas';
import { repositorioUsuarios } from '@/db/repositorios/usuarios';
import { PainelComTrilhas } from '@/components/layout/PainelComTrilhas';

export const metadata = { title: 'Partidas — Shuichi Pull' };

function formatarDataHora(d: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  }).format(d);
}

const ROTULO_STATUS: Record<string, string> = {
  agendada: 'AGENDADA', finalizada: 'FINALIZADA', cancelada: 'CANCELADA',
};

export default async function PaginaPartidas() {
  const sessao = await auth();
  const todas = await repositorioPartidas.listarAbertas();

  const hosts = new Map<string, string>();
  for (const p of todas) {
    if (!hosts.has(p.hostDiscordId)) {
      const u = await repositorioUsuarios.buscar(p.hostDiscordId);
      hosts.set(p.hostDiscordId, u?.discordNome ?? 'alguém');
    }
  }

  const participantesPorPartida = new Map<number, number>();
  for (const p of todas) {
    participantesPorPartida.set(p.id, (await repositorioPartidas.participantes(p.id)).length);
  }

  const agendadas = todas.filter((p) => p.status === 'agendada');
  const finalizadas = todas.filter((p) => p.status === 'finalizada');

  return (
    <PainelComTrilhas>
      <p className="font-mono text-[8px] tracking-[.2em] text-dim">ARQUIVO 09</p>
      <h1 className="mb-1 text-4xl font-black tracking-tight text-[#F2F2F5]">PARTIDAS</h1>
      <p className="mb-6 text-[11px] text-dim">
        Organize quem é o host, quem participa e com qual personagem — sem depender do Discord.
      </p>

      {sessao?.user?.discordId ? (
        <Link
          href="/partidas/nova/"
          className="mb-8 inline-block rounded-[3px] border-2 border-alter-green bg-ego-escuro px-3 py-1.5 font-mono text-[10px] tracking-[.1em] text-[#D6D6E0] hover:bg-alter-green hover:text-[#08090D]"
        >
          + Nova partida
        </Link>
      ) : (
        <p className="mb-8 font-mono text-[9px] text-dim">
          <Link href="/conta/" className="text-alter-green hover:underline">Entra com o Discord</Link> pra criar uma partida.
        </p>
      )}

      <section className="mb-10">
        <h2 className="mb-3 flex items-center gap-2 font-serif text-[13px] tracking-[.16em] text-[#B9B9C6]">
          <span className="h-px flex-1 bg-line" />
          Agendadas
          <span className="h-px flex-1 bg-line" />
        </h2>
        {agendadas.length === 0 ? (
          <p className="text-[11px] text-dim">Nenhuma partida agendada ainda.</p>
        ) : (
          <ul className="grid gap-2.5 sm:grid-cols-2">
            {agendadas.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/partidas/${p.id}/`}
                  className="block overflow-hidden rounded-[4px] border border-line bg-sur transition-colors hover:border-alter-green"
                >
                  {p.capaUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.capaUrl} alt="" className="h-24 w-full object-cover" />
                  )}
                  <div className="p-3">
                    <p className="text-[12px] font-bold text-[#D6D6E0]">{p.titulo}</p>
                    <p className="mt-1 font-mono text-[9px] text-dim">
                      host: {hosts.get(p.hostDiscordId)} · {formatarDataHora(p.dataHora)}
                    </p>
                    <p className="mt-1 font-mono text-[8px] text-alter-green">
                      {participantesPorPartida.get(p.id) ?? 0} participante(s)
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {finalizadas.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 font-serif text-[13px] tracking-[.16em] text-[#B9B9C6]">
            <span className="h-px flex-1 bg-line" />
            Finalizadas
            <span className="h-px flex-1 bg-line" />
          </h2>
          <ul className="flex flex-wrap gap-1.5">
            {finalizadas.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/partidas/${p.id}/`}
                  className="rounded-[2px] border border-line px-1.5 py-0.5 font-mono text-[9px] text-dim hover:border-alter-green hover:text-alter-green"
                >
                  {p.titulo} · {ROTULO_STATUS[p.status]}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </PainelComTrilhas>
  );
}
