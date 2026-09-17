import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { repositorioPartidas } from '@/db/repositorios/partidas';
import { repositorioUsuarios } from '@/db/repositorios/usuarios';
import { repositorioPartidaAvaliacoes } from '@/db/repositorios/partida-avaliacoes';
import { listarPersonagens } from '@/lib/dados';
import { ID_MONOKUMA } from '@/lib/monokuma';
import { PainelComTrilhas } from '@/components/layout/PainelComTrilhas';
import { EntrarPartida } from '@/components/partidas/EntrarPartida';
import { ControlesHost } from '@/components/partidas/ControlesHost';
import { AvaliarParticipantes } from '@/components/partidas/AvaliarParticipantes';
import {
  entrarPartidaAction, sairPartidaAction, atualizarPartidaAction, mudarStatusPartidaAction,
  salvarRelatorioAction, avaliarParticipanteAction, removerAvaliacaoAction,
} from '../acoes';

const ROTULO_RESULTADO: Record<string, string> = {
  vitoria_alunos: 'Vitória dos alunos', vitoria_mestre: 'Vitória do mestre', tragedia: 'Tragédia (ninguém venceu)',
};

function paraDatetimeLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatarDataHora(d: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  }).format(d);
}

const ROTULO_STATUS: Record<string, string> = {
  agendada: 'AGENDADA', finalizada: 'FINALIZADA', cancelada: 'CANCELADA',
};

export default async function PaginaPartida({ params }: { params: Promise<{ id: string }> }) {
  const { id: idTexto } = await params;
  const id = Number(idTexto);
  if (!Number.isInteger(id)) notFound();

  const partida = await repositorioPartidas.buscar(id);
  if (!partida) notFound();

  const [sessao, participantes, host] = await Promise.all([
    auth(),
    repositorioPartidas.participantes(id),
    repositorioUsuarios.buscar(partida.hostDiscordId),
  ]);

  const personagens = listarPersonagens();
  const nomePersonagem = new Map(personagens.map((p) => [p.id, p.nome]));

  const usuariosParticipantes = new Map<string, string>();
  for (const part of participantes) {
    const u = await repositorioUsuarios.buscar(part.discordId);
    usuariosParticipantes.set(part.discordId, u?.discordNome ?? 'alguém');
  }

  const discordId = sessao?.user?.discordId;
  const souHost = discordId === partida.hostDiscordId;
  const minhaEntrada = discordId ? participantes.find((p) => p.discordId === discordId) : undefined;

  const avaliaveis = partida.status === 'finalizada' && discordId && minhaEntrada
    ? await (async () => {
        const avaliacoes = await repositorioPartidaAvaliacoes.listarPorPartida(id);
        return participantes
          .filter((p) => p.discordId !== discordId)
          .map((p) => {
            const doOutros = avaliacoes.filter((a) => a.avaliadoDiscordId === p.discordId);
            const minha = avaliacoes.find(
              (a) => a.avaliadoDiscordId === p.discordId && a.avaliadorDiscordId === discordId,
            );
            return {
              discordId: p.discordId,
              nome: usuariosParticipantes.get(p.discordId) ?? 'alguém',
              likes: doOutros.filter((a) => a.tipo === 'like').length,
              dislikes: doOutros.filter((a) => a.tipo === 'dislike').length,
              minhaAvaliacao: (minha?.tipo as 'like' | 'dislike' | undefined) ?? null,
              meuComentario: minha?.comentario ?? '',
            };
          });
      })()
    : [];

  return (
    <PainelComTrilhas as="article">
      <p className="font-mono text-[8px] tracking-[.2em] text-dim">ARQUIVO 09</p>
      {partida.capaUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={partida.capaUrl}
          alt=""
          className="mb-4 h-48 w-full rounded-[4px] border border-line object-cover sm:h-64"
        />
      )}

      <header className="mb-6">
        <h1 className="text-3xl font-black leading-tight tracking-tight text-[#F2F2F5] sm:text-4xl">
          {partida.titulo}
        </h1>
        <p className="mt-1 font-mono text-[10px] text-dim">
          host:{' '}
          <a href={`/u/${partida.hostDiscordId}/`} className="text-[#D6D6E0] hover:text-cyber-cyan hover:underline">
            {host?.discordNome ?? 'alguém'}
          </a>
          {' '}· {formatarDataHora(partida.dataHora)}
        </p>
        <span
          className={`mt-2 inline-block rounded-[2px] border px-1.5 py-0.5 font-mono text-[8px] tracking-[.1em] ${
            partida.status === 'agendada' ? 'border-alter-green text-alter-green'
            : partida.status === 'finalizada' ? 'border-cyber-cyan text-cyber-cyan'
            : 'border-alerta text-alerta'
          }`}
        >
          {ROTULO_STATUS[partida.status]}
        </span>
      </header>

      {partida.regras && (
        <section className="mb-6 max-w-2xl">
          <h2 className="mb-1 font-mono text-[9px] tracking-[.14em] text-dim">REGRAS</h2>
          <p className="whitespace-pre-line text-[12px] leading-relaxed text-[#C8C8D4]">{partida.regras}</p>
        </section>
      )}

      {(partida.capitulo || partida.blackened || partida.mvpDiscordId || partida.resultado) && (
        <section className="mb-6 max-w-2xl rounded-[4px] border border-cyber-cyan/30 bg-[#0A1218] p-3">
          <h2 className="mb-2 font-mono text-[9px] tracking-[.14em] text-cyber-cyan">RELATÓRIO DA PARTIDA</h2>
          <dl className="space-y-1 text-[11px] text-[#C8C8D4]">
            {partida.capitulo && (
              <div><dt className="inline text-dim">Capítulo: </dt><dd className="inline">{partida.capitulo}</dd></div>
            )}
            {partida.blackened && (
              <div>
                <dt className="inline text-dim">Blackened: </dt>
                <dd className="inline">{usuariosParticipantes.get(partida.blackened) ?? 'alguém'}</dd>
              </div>
            )}
            {partida.mvpDiscordId && (
              <div>
                <dt className="inline text-dim">MVP: </dt>
                <dd className="inline">{usuariosParticipantes.get(partida.mvpDiscordId) ?? 'alguém'}</dd>
              </div>
            )}
            {partida.resultado && (
              <div>
                <dt className="inline text-dim">Status: </dt>
                <dd className="inline">{ROTULO_RESULTADO[partida.resultado] ?? partida.resultado}</dd>
              </div>
            )}
          </dl>
        </section>
      )}

      <section className="mb-6">
        <h2 className="mb-2 font-mono text-[9px] tracking-[.14em] text-dim">
          PARTICIPANTES ({participantes.length})
        </h2>
        {participantes.length === 0 ? (
          <p className="text-[11px] text-dim">Ninguém entrou ainda.</p>
        ) : (
          <ul className="space-y-1.5">
            {participantes.map((p) => (
              <li key={p.discordId} className="flex items-center gap-2 text-[12px] text-[#D6D6E0]">
                <a href={`/u/${p.discordId}/`} className="font-bold hover:text-cyber-cyan hover:underline">
                  {usuariosParticipantes.get(p.discordId)}
                </a>
                {p.personagemId === ID_MONOKUMA ? (
                  <span className="font-mono text-[9px] text-execution-pink">→ MONOKUMA (HOST)</span>
                ) : p.personagemId && (
                  <span className="font-mono text-[9px] text-alter-green">
                    → {nomePersonagem.get(p.personagemId) ?? p.personagemId}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {avaliaveis.length > 0 && (
        <AvaliarParticipantes
          partidaId={partida.id}
          participantes={avaliaveis}
          aoAvaliar={avaliarParticipanteAction}
          aoRemover={removerAvaliacaoAction}
        />
      )}

      {partida.status === 'agendada' && discordId && (
        <EntrarPartida
          partidaId={partida.id}
          personagemAtual={minhaEntrada?.personagemId ?? null}
          personagens={personagens.map((p) => ({ id: p.id, nome: p.nome, sprite: p.sprite }))}
          souHost={souHost}
          aoEntrar={entrarPartidaAction}
          aoSair={sairPartidaAction}
        />
      )}

      {!discordId && partida.status === 'agendada' && (
        <p className="font-mono text-[9px] text-dim">
          <a href="/conta/" className="text-alter-green hover:underline">Entra com o Discord</a> pra participar.
        </p>
      )}

      {souHost && (
        <ControlesHost
          partidaId={partida.id}
          status={partida.status}
          participantes={participantes.map((p) => ({
            discordId: p.discordId, nome: usuariosParticipantes.get(p.discordId) ?? 'alguém',
          }))}
          inicial={{
            titulo: partida.titulo,
            dataHora: paraDatetimeLocal(partida.dataHora),
            regras: partida.regras ?? '',
            capaUrl: partida.capaUrl ?? '',
          }}
          relatorioInicial={{
            capitulo: partida.capitulo ?? '',
            blackened: partida.blackened ?? '',
            mvpDiscordId: partida.mvpDiscordId ?? '',
            resultado: partida.resultado,
          }}
          aoAtualizar={atualizarPartidaAction}
          aoMudarStatus={mudarStatusPartidaAction}
          aoSalvarRelatorio={salvarRelatorioAction}
        />
      )}
    </PainelComTrilhas>
  );
}
