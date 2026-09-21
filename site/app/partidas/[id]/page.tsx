import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { repositorioPartidas } from '@/db/repositorios/partidas';
import { repositorioUsuarios } from '@/db/repositorios/usuarios';
import { repositorioPartidaAvaliacoes } from '@/db/repositorios/partida-avaliacoes';
import { repositorioPartidaCapitulos } from '@/db/repositorios/partida-capitulos';
import { listarPersonagensComCorrecoes } from '@/lib/dados-corrigidos';
import { ID_MONOKUMA } from '@/lib/monokuma';
import { iconeDoInscrito, spritePixelDe } from '@/lib/sprites-pixel';
import { ocupamVaga } from '@/lib/vagas';
import { ROTULO_RESULTADO, ROTULO_STATUS } from '@/lib/rotulos-partida';
import { PainelComTrilhas } from '@/components/layout/PainelComTrilhas';
import { EntrarPartida } from '@/components/partidas/EntrarPartida';
import { ControlesHost } from '@/components/partidas/ControlesHost';
import { AvaliarParticipantes } from '@/components/partidas/AvaliarParticipantes';
import { CapitulosPartida } from '@/components/partidas/CapitulosPartida';
import { AlertaInicio } from '@/components/partidas/AlertaInicio';
import { BarraVagas } from '@/components/partidas/BarraVagas';
import { Contagem } from '@/components/partidas/Contagem';
import {
  entrarPartidaAction, sairPartidaAction, atualizarPartidaAction, mudarStatusPartidaAction,
  salvarRelatorioAction, avaliarParticipanteAction, removerAvaliacaoAction,
  salvarCapituloAction, removerCapituloAction,
} from '../acoes';

function paraDatetimeLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatarDataHora(d: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  }).format(d);
}

export default async function PaginaPartida({ params }: { params: Promise<{ id: string }> }) {
  const { id: idTexto } = await params;
  const id = Number(idTexto);
  if (!Number.isInteger(id)) notFound();

  const partida = await repositorioPartidas.buscar(id);
  if (!partida) notFound();

  const [sessao, participantes, host, capitulos] = await Promise.all([
    auth(),
    repositorioPartidas.participantes(id),
    repositorioUsuarios.buscar(partida.hostDiscordId),
    repositorioPartidaCapitulos.listarPorPartida(id),
  ]);

  const personagens = await listarPersonagensComCorrecoes();
  const nomePersonagem = new Map(personagens.map((p) => [p.id, p.nome]));
  const retratoPorId = new Map(personagens.map((p) => [p.id, p.sprite]));

  const usuariosParticipantes = new Map<string, string>();
  const uidsParticipantes = new Map<string, string | null>();
  for (const part of participantes) {
    const u = await repositorioUsuarios.buscar(part.discordId);
    usuariosParticipantes.set(part.discordId, u?.discordNome ?? 'alguém');
    uidsParticipantes.set(part.discordId, u?.uuidGmod ?? null);
  }

  const titulares = participantes.filter((p) => p.tipo === 'participante');
  const ocupadas = ocupamVaga(participantes).length;
  const reservas = participantes.filter((p) => p.tipo === 'reserva');

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

  function linhaInscrito(p: (typeof participantes)[number], corTexto: string, corBorda: string) {
    const icone = iconeDoInscrito(p.personagemId, retratoPorId);
    return (
      <li key={p.discordId} className="flex items-center gap-2.5 text-[13px] text-[#D6D6E0]">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center border-2 bg-[#0E0E13] ${corBorda}`}>
          {icone ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={icone} alt="" className="h-full w-full object-contain" style={{ imageRendering: 'pixelated' }} />
          ) : (
            <span aria-hidden className="font-mono text-[13px] text-dim">?</span>
          )}
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="flex flex-wrap items-baseline gap-x-2">
            <a href={`/u/${p.discordId}/`} className="font-bold hover:text-cyber-cyan hover:underline">
              {usuariosParticipantes.get(p.discordId)}
            </a>
            {p.personagemId === ID_MONOKUMA ? (
              <span className="font-mono text-[10px] text-execution-pink">→ MONOKUMA (HOST)</span>
            ) : p.personagemId ? (
              <span className={`font-mono text-[10px] ${corTexto}`}>
                → {nomePersonagem.get(p.personagemId) ?? p.personagemId}
              </span>
            ) : (
              <span className="font-mono text-[10px] text-dim">→ vaga genérica</span>
            )}
          </span>
          <span className="font-mono text-[9px] text-dim">
            UID: {uidsParticipantes.get(p.discordId) ?? 'não informado'}
          </span>
        </span>
      </li>
    );
  }

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

      {minhaEntrada && partida.status === 'agendada' && (
        <AlertaInicio dataHora={partida.dataHora.toISOString()} />
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

        {partida.status === 'agendada' && (
          <div className="mt-4 flex flex-wrap items-end gap-x-8 gap-y-3">
            <div>
              <p className="font-mono text-[10px] tracking-[.2em] text-dim">COMEÇA EM</p>
              <Contagem
                dataHora={partida.dataHora.toISOString()}
                className="block font-mono text-4xl font-black text-execution-pink [text-shadow:0_0_14px_rgba(255,0,127,.45)]"
              />
            </div>
            <BarraVagas ocupadas={ocupadas} total={partida.vagas} />
          </div>
        )}
      </header>

      {partida.regras && (
        <section className="mb-6 max-w-2xl">
          <h2 className="mb-1 font-mono text-[9px] tracking-[.14em] text-dim">REGRAS</h2>
          <p className="whitespace-pre-line text-[12px] leading-relaxed text-[#C8C8D4]">{partida.regras}</p>
        </section>
      )}

      {(partida.capitulo || partida.blackened || partida.mvpDiscordIds.length > 0 || partida.resultado) && (
        <section className="mb-6 max-w-2xl rounded-[4px] border border-cyber-cyan/30 bg-[#0A1218] p-3">
          <h2 className="mb-2 font-mono text-[9px] tracking-[.14em] text-cyber-cyan">RELATÓRIO DA PARTIDA</h2>
          <dl className="space-y-1 text-[11px] text-[#C8C8D4]">
            {partida.capitulo && (
              <div><dt className="inline text-dim">Resumo: </dt><dd className="inline">{partida.capitulo}</dd></div>
            )}
            {partida.blackened && (
              <div>
                <dt className="inline text-dim">Blackened: </dt>
                <dd className="inline">{usuariosParticipantes.get(partida.blackened) ?? 'alguém'}</dd>
              </div>
            )}
            {partida.mvpDiscordIds.length > 0 && (
              <div>
                <dt className="inline text-dim">MVP{partida.mvpDiscordIds.length > 1 ? 's' : ''}: </dt>
                <dd className="inline">
                  {partida.mvpDiscordIds.map((id) => usuariosParticipantes.get(id) ?? 'alguém').join(', ')}
                </dd>
              </div>
            )}
            {partida.resultado && (
              <div>
                <dt className="inline text-dim">Desfecho: </dt>
                <dd className="inline">{ROTULO_RESULTADO[partida.resultado] ?? partida.resultado}</dd>
              </div>
            )}
          </dl>
        </section>
      )}

      <CapitulosPartida
        partidaId={partida.id}
        capitulos={capitulos}
        participantes={participantes.map((p) => ({
          discordId: p.discordId, nome: usuariosParticipantes.get(p.discordId) ?? 'alguém',
        }))}
        editavel={souHost && partida.status === 'finalizada'}
        aoSalvar={salvarCapituloAction}
        aoRemover={removerCapituloAction}
      />

      <section className="mb-6">
        <h2 className="mb-2 font-mono text-[10px] tracking-[.14em] text-dim">
          PARTICIPANTES ({ocupadas}/{partida.vagas})
        </h2>
        {titulares.length === 0 ? (
          <p className="text-[12px] text-dim">Ninguém entrou ainda.</p>
        ) : (
          <ul className="space-y-2">
            {titulares.map((p) => linhaInscrito(p, 'text-alter-green', 'border-alter-green/70'))}
          </ul>
        )}
      </section>

      {reservas.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 font-mono text-[10px] tracking-[.14em] text-amber">
            RESERVAS ({reservas.length}) — entram se um titular cair
          </h2>
          <ul className="space-y-2">
            {reservas.map((p) => linhaInscrito(p, 'text-amber', 'border-amber/70'))}
          </ul>
        </section>
      )}

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
          tipoAtual={minhaEntrada?.tipo}
          personagens={personagens.map((p) => ({
            id: p.id, nome: p.nome, sprite: p.sprite, pixel: spritePixelDe(p.id),
          }))}
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
            vagas: partida.vagas,
          }}
          relatorioInicial={{
            capitulo: partida.capitulo ?? '',
            blackened: partida.blackened ?? '',
            mvpDiscordIds: partida.mvpDiscordIds,
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
