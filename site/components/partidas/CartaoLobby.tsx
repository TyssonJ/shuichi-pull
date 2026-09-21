import Link from 'next/link';
import { BarraVagas } from './BarraVagas';
import { Contagem } from './Contagem';
import { Cronometro } from './Cronometro';
import { IconesInscritos, type IconeInscrito } from './IconesInscritos';
import { HorarioLocal } from './HorarioLocal';

export type DadosCartaoLobby = {
  id: number;
  titulo: string;
  capaUrl: string | null;
  hostNome: string;
  dataHoraIso: string;
  dataHoraTexto: string;
  vagas: number;
  ocupadas: number;
  reservas: number;
  inscritos: IconeInscrito[];
  voceInscrito: boolean;
  /** Só em partida em andamento: quando o host apertou "Começar". */
  iniciadaEmIso?: string | null;
  /** Só em partida finalizada com início registrado: "1h 12min". */
  duracaoTexto?: string | null;
};

function Capa({ url }: { url: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" aria-hidden loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover opacity-25" />
  );
}

/** A próxima sessão: grande, com a contagem regressiva em primeiro plano. */
export function CartaoLobbyDestaque({ d }: { d: DadosCartaoLobby }) {
  return (
    <Link
      href={`/partidas/${d.id}/`}
      className="clip-dossier-card group relative block overflow-hidden border-2 border-execution-pink/60 bg-[#0B0710] p-5 transition-colors hover:border-execution-pink sm:p-6"
    >
      {d.capaUrl && <Capa url={d.capaUrl} />}
      <div aria-hidden className="crt-lines pointer-events-none absolute inset-0 opacity-30" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0B0710] via-[#0B0710]/70 to-transparent" />

      <div className="relative grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="mb-2 flex items-center gap-2 font-mono text-[11px] tracking-[.2em] text-execution-pink">
            <span aria-hidden className="h-2 w-2 animate-pulse rounded-full bg-execution-pink" />
            PRÓXIMA SESSÃO
            {d.voceInscrito && <span className="rounded-[2px] border border-alter-green px-1.5 py-px text-alter-green">VOCÊ ESTÁ DENTRO</span>}
          </p>
          <h2 className="text-3xl font-black leading-[.95] tracking-tight text-[#F2F2F5] sm:text-5xl">{d.titulo}</h2>
          <p className="mt-2 font-mono text-[12px] text-[#B9B9C6]">
            host: <b className="text-[#F2F2F5]">{d.hostNome}</b> · {d.dataHoraTexto}
            <HorarioLocal iso={d.dataHoraIso} className="block" />
          </p>
          <div className="mt-4"><BarraVagas ocupadas={d.ocupadas} total={d.vagas} reservas={d.reservas} /></div>
          <div className="mt-3"><IconesInscritos inscritos={d.inscritos} /></div>
        </div>

        <div className="sm:text-right">
          <p className="font-mono text-[10px] tracking-[.2em] text-dim">COMEÇA EM</p>
          <Contagem dataHora={d.dataHoraIso} className="block font-mono text-4xl font-black tracking-tight text-execution-pink [text-shadow:0_0_16px_rgba(255,0,127,.5)] sm:text-6xl" />
          <span className="mt-3 inline-block border-2 border-execution-pink px-4 py-2 font-mono text-[12px] font-bold tracking-[.14em] text-execution-pink transition-colors group-hover:bg-execution-pink group-hover:text-[#08090D]">
            ENTRAR NA SALA →
          </span>
        </div>
      </div>
    </Link>
  );
}

export function CartaoLobby({ d }: { d: DadosCartaoLobby }) {
  return (
    <Link
      href={`/partidas/${d.id}/`}
      className="clip-dossier-card group relative block overflow-hidden border-2 border-line bg-[#0C0C12] p-4 transition-colors hover:border-alter-green"
    >
      {d.capaUrl && <Capa url={d.capaUrl} />}
      <div aria-hidden className="crt-lines pointer-events-none absolute inset-0 opacity-25" />
      <div className="relative">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-xl font-black leading-tight text-[#F2F2F5]">{d.titulo}</h3>
          <Contagem dataHora={d.dataHoraIso} className="shrink-0 font-mono text-[14px] font-bold text-execution-pink" />
        </div>
        <p className="mt-1 font-mono text-[11px] text-[#B9B9C6]">
          {d.hostNome} · {d.dataHoraTexto}
          <HorarioLocal iso={d.dataHoraIso} className="block" />
          {d.voceInscrito && <span className="ml-2 text-alter-green">● VOCÊ ESTÁ DENTRO</span>}
        </p>
        <div className="mt-3"><BarraVagas ocupadas={d.ocupadas} total={d.vagas} reservas={d.reservas} /></div>
        <div className="mt-2.5"><IconesInscritos inscritos={d.inscritos} max={10} /></div>
      </div>
    </Link>
  );
}

/** Partida rolando agora: o cronômetro é o protagonista, em rosa pulsante. */
export function CartaoAoVivo({ d }: { d: DadosCartaoLobby }) {
  return (
    <Link
      href={`/partidas/${d.id}/`}
      className="clip-dossier-card group relative block overflow-hidden border-2 border-execution-pink bg-[#12060C] p-4 shadow-[0_0_24px_rgba(255,0,127,.25)] transition-colors hover:border-[#FF5FA8] sm:p-5"
    >
      {d.capaUrl && <Capa url={d.capaUrl} />}
      <div aria-hidden className="crt-lines pointer-events-none absolute inset-0 opacity-30" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#12060C] via-[#12060C]/75 to-transparent" />

      <div className="relative flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <p className="mb-1.5 flex items-center gap-2 font-mono text-[11px] font-bold tracking-[.2em] text-execution-pink">
            <span aria-hidden className="h-2.5 w-2.5 animate-pulse rounded-full bg-execution-pink" />
            AO VIVO
            {d.voceInscrito && <span className="rounded-[2px] border border-alter-green px-1.5 py-px text-alter-green">VOCÊ ESTÁ NA PARTIDA</span>}
          </p>
          <h3 className="text-2xl font-black leading-tight tracking-tight text-[#F2F2F5] sm:text-3xl">{d.titulo}</h3>
          <p className="mt-1 font-mono text-[11px] text-[#B9B9C6]">host: <b className="text-[#F2F2F5]">{d.hostNome}</b></p>
          <div className="mt-3"><IconesInscritos inscritos={d.inscritos} max={12} /></div>
        </div>

        <div className="text-right">
          <p className="font-mono text-[9px] tracking-[.2em] text-dim">TEMPO DE PARTIDA</p>
          {d.iniciadaEmIso ? (
            <Cronometro desdeIso={d.iniciadaEmIso} className="block font-mono text-4xl font-black tracking-tight text-execution-pink [text-shadow:0_0_16px_rgba(255,0,127,.5)] sm:text-5xl" />
          ) : (
            <span className="block font-mono text-4xl font-black text-execution-pink">--:--:--</span>
          )}
        </div>
      </div>
    </Link>
  );
}
