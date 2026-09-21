import { notFound } from 'next/navigation';
import Link from 'next/link';
import { repositorioUsuarios } from '@/db/repositorios/usuarios';
import { repositorioPartidas } from '@/db/repositorios/partidas';
import { listarPersonagensComCorrecoes } from '@/lib/dados-corrigidos';
import { tituloPorPartidas } from '@/lib/titulos';
import { PainelComTrilhas } from '@/components/layout/PainelComTrilhas';

function formatarData(d: Date): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const usuario = await repositorioUsuarios.buscar(id);
  return { title: usuario ? `${usuario.discordNome} — Shuichi Pull` : 'Perfil não encontrado — Shuichi Pull' };
}

function Estatistica({ valor, rotulo, cor }: { valor: number; rotulo: string; cor: string }) {
  return (
    <div className="clip-dossier-card border border-line bg-[#0E0E13] p-2.5 text-center">
      <p className="font-mono text-2xl font-black leading-none" style={{ color: cor }}>{valor}</p>
      <p className="mt-1 font-mono text-[8px] uppercase tracking-[.1em] text-dim">{rotulo}</p>
    </div>
  );
}

const DESFECHO_COR = {
  vitoria: { borda: 'border-alter-green/50', texto: 'text-alter-green', rotulo: 'VITÓRIA' },
  derrota: { borda: 'border-execution-pink/50', texto: 'text-execution-pink', rotulo: 'DERROTA' },
  tragedia: { borda: 'border-line', texto: 'text-dim', rotulo: 'TRAGÉDIA' },
} as const;

export default async function PerfilPublico({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const usuario = await repositorioUsuarios.buscar(id);
  if (!usuario) notFound();

  const [{ historico, estatisticas }, personagens] = await Promise.all([
    repositorioPartidas.perfilDoUsuario(id),
    listarPersonagensComCorrecoes(),
  ]);
  const porId = new Map(personagens.map((p) => [p.id, p]));
  const mains = usuario.mains.map((mid) => porId.get(mid)).filter((p) => p !== undefined);
  const titulo = tituloPorPartidas(estatisticas.total);

  return (
    <PainelComTrilhas as="article">
      <div className="clip-dossier-card relative overflow-hidden border-2 border-alter-green/40 bg-[#050805] p-4">
        <div aria-hidden className="crt-lines pointer-events-none absolute inset-0 opacity-20" />
        <p className="relative font-mono text-[8px] tracking-[.25em] text-alter-green/70">
          [ ARQUIVO DE ESTUDANTE // CONFIDENCIAL ]
        </p>
        <div className="relative mt-2 flex items-center gap-3">
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
            <p className="mt-1 font-mono text-[9px] tracking-[.1em] text-dim">
              NO ARQUIVO DESDE {formatarData(usuario.criadoEm)}
            </p>
            {titulo && (
              <span className="mt-1.5 inline-block rounded-[2px] border border-alter-green px-1.5 py-0.5 font-mono text-[9px] tracking-[.1em] text-alter-green">
                {titulo}
              </span>
            )}
          </div>
        </div>
      </div>

      <section className="mt-6">
        <h2 className="mb-2 font-mono text-[10px] tracking-[.14em] text-dim">
          ESTATÍSTICAS DE COMBATE E INVESTIGAÇÃO
        </h2>
        {estatisticas.total === 0 ? (
          <p className="text-[12px] text-dim">Nenhuma partida finalizada ainda.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            <Estatistica valor={estatisticas.total} rotulo="Partidas" cor="#D6D6E0" />
            <Estatistica valor={estatisticas.vitorias} rotulo="Vitórias" cor="#00FF66" />
            <Estatistica valor={estatisticas.derrotas} rotulo="Derrotas" cor="#FF007F" />
            <Estatistica valor={estatisticas.tragedias} rotulo="Tragédias" cor="#7A7A88" />
            <Estatistica valor={estatisticas.mvps} rotulo="MVPs" cor="#F5D30E" />
            <Estatistica valor={estatisticas.comoBlackened} rotulo="Como Blackened" cor="#FF007F" />
            <Estatistica valor={estatisticas.comoDetetive} rotulo="Como Detetive" cor="#00F0FF" />
            <Estatistica valor={estatisticas.casosResolvidos} rotulo="Casos Resolvidos" cor="#00FF66" />
            <Estatistica valor={estatisticas.assassinado} rotulo="Assassinado(a)" cor="#FF3B3B" />
            <Estatistica valor={estatisticas.afk} rotulo="AFK / Quedas" cor="#F59E0B" />
          </div>
        )}
      </section>

      {mains.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 font-mono text-[10px] tracking-[.14em] text-dim">MAINS</h2>
          <ul className="flex flex-wrap gap-2">
            {mains.map((p) => (
              <li key={p!.id}>
                <Link
                  href={`/elenco/${p!.id}/`}
                  className="flex items-center gap-1.5 rounded-[3px] border border-line bg-sur px-2 py-1 hover:border-alter-green"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p!.sprite} alt="" className="h-6 w-6 object-contain" />
                  <span className="text-[12px] text-[#D6D6E0]">{p!.nome}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6">
        <h2 className="mb-2 font-mono text-[10px] tracking-[.14em] text-dim">
          HISTÓRICO DE PARTIDAS{estatisticas.total > 0 && ` — ${estatisticas.total} finalizada${estatisticas.total > 1 ? 's' : ''}`}
        </h2>
        {historico.length === 0 ? (
          <p className="text-[12px] text-dim">Nenhuma partida finalizada ainda.</p>
        ) : (
          <ul className="max-h-[32rem] space-y-1.5 overflow-y-auto pr-1">
            {historico.map((p) => {
              const d = p.desfecho ? DESFECHO_COR[p.desfecho] : null;
              return (
                <li key={p.id}>
                  <Link
                    href={`/partidas/${p.id}/`}
                    className={`flex flex-wrap items-baseline gap-x-2 rounded-[3px] border ${d?.borda ?? 'border-line'} bg-sur px-2 py-1.5 text-[13px] text-[#D6D6E0] hover:border-cyber-cyan`}
                  >
                    <span className="font-bold">{p.titulo}</span>
                    {p.eraBlackened && (
                      <span className="font-mono text-[9px] text-execution-pink">BLACKENED</span>
                    )}
                    {d && <span className={`font-mono text-[9px] ${d.texto}`}>{d.rotulo}</span>}
                    <span className="ml-auto font-mono text-[10px] text-dim">
                      {formatarData(p.dataHora)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </PainelComTrilhas>
  );
}
