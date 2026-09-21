import Link from 'next/link';
import { auth } from '@/auth';
import { repositorioPartidas, type PartidaLinha } from '@/db/repositorios/partidas';
import { repositorioUsuarios } from '@/db/repositorios/usuarios';
import { listarPersonagensComCorrecoes } from '@/lib/dados-corrigidos';
import { iconeDoInscrito } from '@/lib/sprites-pixel';
import { ID_MONOKUMA } from '@/lib/monokuma';
import { ocupamVaga, vagasRestantes } from '@/lib/vagas';
import { SELO_RESULTADO } from '@/lib/rotulos-partida';
import { PainelComTrilhas } from '@/components/layout/PainelComTrilhas';
import { JanelaTerminal } from '@/components/mecanicas/JanelaTerminal';
import { CartaoLobby, CartaoLobbyDestaque, type DadosCartaoLobby } from '@/components/partidas/CartaoLobby';

export const metadata = { title: 'Partidas — Shuichi Pull' };

const TRES_HORAS = 3 * 60 * 60 * 1000;

/** A página é dinâmica: "agora" é o momento do pedido, de propósito — e a
 * regra de pureza do React não vê através de uma função de módulo. */
const agoraMs = () => Date.now();

function formatarDataHora(d: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  }).format(d);
}

function formatarData(d: Date): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(d);
}

function Painel({ valor, rotulo, cor }: { valor: string | number; rotulo: string; cor: string }) {
  return (
    <div className="border border-[#0F5A2E] bg-[#03100A]/80 px-3 py-2">
      <p className="font-mono text-2xl font-black leading-none" style={{ color: cor }}>{valor}</p>
      <p className="mt-1 font-mono text-[9px] tracking-[.16em] text-[#5FBF85]">{rotulo}</p>
    </div>
  );
}

export default async function PaginaPartidas() {
  const [sessao, todas, personagens] = await Promise.all([
    auth(),
    repositorioPartidas.listarAbertas(),
    listarPersonagensComCorrecoes(),
  ]);
  const discordId = sessao?.user?.discordId;

  const retratoPorId = new Map(personagens.map((p) => [p.id, p.sprite]));
  const nomePorId = new Map(personagens.map((p) => [p.id, p.nome]));

  const carregadas = await Promise.all(todas.map(async (p: PartidaLinha) => {
    const [inscritos, host] = await Promise.all([
      repositorioPartidas.participantes(p.id),
      repositorioUsuarios.buscar(p.hostDiscordId),
    ]);
    const ordenados = [...inscritos].sort((a, b) => Number(a.tipo === 'reserva') - Number(b.tipo === 'reserva'));
    const dados: DadosCartaoLobby = {
      id: p.id,
      titulo: p.titulo,
      capaUrl: p.capaUrl,
      hostNome: host?.discordNome ?? 'alguém',
      dataHoraIso: p.dataHora.toISOString(),
      dataHoraTexto: formatarDataHora(p.dataHora),
      vagas: p.vagas,
      ocupadas: ocupamVaga(inscritos).length,
      reservas: inscritos.filter((i) => i.tipo === 'reserva').length,
      inscritos: ordenados.map((i) => ({
        src: iconeDoInscrito(i.personagemId, retratoPorId),
        tipo: i.tipo,
        nome: i.personagemId === ID_MONOKUMA ? 'Monokuma (host)'
          : (i.personagemId && nomePorId.get(i.personagemId)) || 'vaga genérica',
      })),
      voceInscrito: !!discordId && inscritos.some((i) => i.discordId === discordId),
    };
    return { partida: p, inscritos, dados };
  }));

  const agora = agoraMs();
  const agendadas = carregadas.filter((c) => c.partida.status === 'agendada');
  const finalizadas = carregadas.filter((c) => c.partida.status === 'finalizada').reverse();

  const proxima = agendadas.find((c) => c.partida.dataHora.getTime() >= agora - TRES_HORAS);
  const outras = agendadas.filter((c) => c !== proxima);

  const jogadoresNoLobby = new Set(agendadas.flatMap((c) => c.inscritos.map((i) => i.discordId))).size;
  const vagasLivres = agendadas.reduce((soma, c) => soma + vagasRestantes(c.inscritos, c.partida.vagas), 0);

  return (
    <PainelComTrilhas>
      <JanelaTerminal titulo="[ LOBBY_CENTRAL v1.0 // PARTIDAS.EXE ]">
        <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <p className="font-mono text-[10px] tracking-[.25em] text-[#5FBF85]">ARQUIVO 09 // SALAS DE JOGO</p>
            <h1 className="mt-1 text-5xl font-black leading-none tracking-tight text-alter-green [text-shadow:0_0_20px_rgba(0,255,102,.45)] sm:text-6xl">
              PARTIDAS
            </h1>
            <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-[#9BE8B5]">
              Escolha a sala, o seu personagem em 8-bit e entre — como titular, reserva ou numa
              vaga genérica. O host conduz como Monokuma.
            </p>
          </div>

          {discordId ? (
            <Link
              href="/partidas/nova/"
              className="animate-pulse border-2 border-execution-pink bg-execution-pink/10 px-5 py-3 text-center font-mono text-[13px] font-bold tracking-[.14em] text-execution-pink hover:animate-none hover:bg-execution-pink hover:text-[#08090D]"
            >
              + ABRIR NOVA SALA
            </Link>
          ) : (
            <Link
              href="/conta/"
              className="border-2 border-alter-green px-5 py-3 text-center font-mono text-[13px] font-bold tracking-[.14em] text-alter-green hover:bg-alter-green hover:text-[#08090D]"
            >
              CONECTAR PRA JOGAR
            </Link>
          )}
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <Painel valor={agendadas.length} rotulo="SALAS ABERTAS" cor="#00FF66" />
          <Painel valor={jogadoresNoLobby} rotulo="JOGADORES NO LOBBY" cor="#00F0FF" />
          <Painel valor={vagasLivres} rotulo="VAGAS LIVRES" cor="#FF007F" />
        </div>
      </JanelaTerminal>

      {agendadas.length === 0 ? (
        <div className="clip-dossier-card mt-6 border-2 border-dashed border-line bg-sur p-6 text-center">
          <p className="font-mono text-[13px] tracking-[.14em] text-dim">[ NENHUMA SALA ABERTA ]</p>
          <p className="mt-2 text-[13px] text-dim">
            O lobby está vazio. {discordId ? 'Abra a primeira sala.' : 'Conecte-se pra abrir a primeira sala.'}
          </p>
        </div>
      ) : (
        <>
          {proxima && (
            <section className="mt-6" aria-label="Próxima sessão">
              <CartaoLobbyDestaque d={proxima.dados} />
            </section>
          )}

          {outras.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-3 flex items-center gap-2 font-mono text-[12px] tracking-[.2em] text-[#B9B9C6]">
                <span className="h-px flex-1 bg-line" />
                {proxima ? 'OUTRAS SALAS' : 'SALAS ABERTAS'}
                <span className="h-px flex-1 bg-line" />
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {outras.map((c) => (
                  <li key={c.partida.id}><CartaoLobby d={c.dados} /></li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      {finalizadas.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 flex items-center gap-2 font-mono text-[12px] tracking-[.2em] text-[#B9B9C6]">
            <span className="h-px flex-1 bg-line" />
            ARQUIVO DE CASOS
            <span className="h-px flex-1 bg-line" />
          </h2>
          <ul className="space-y-1.5">
            {finalizadas.map((c) => (
              <li key={c.partida.id}>
                <Link
                  href={`/partidas/${c.partida.id}/`}
                  className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border border-line bg-sur px-3 py-2 hover:border-cyber-cyan"
                >
                  <span className="text-[14px] font-bold text-[#D6D6E0]">{c.partida.titulo}</span>
                  {c.partida.resultado && (
                    <span className="font-mono text-[10px] tracking-[.1em] text-cyber-cyan">
                      {SELO_RESULTADO[c.partida.resultado]}
                    </span>
                  )}
                  <span className="ml-auto font-mono text-[11px] text-dim">
                    {c.dados.ocupadas} jogadores · {formatarData(c.partida.dataHora)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </PainelComTrilhas>
  );
}
