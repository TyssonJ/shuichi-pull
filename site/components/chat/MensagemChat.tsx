import Link from 'next/link';
import { formatarSegundos } from '@/lib/midia';
import { segmentarMencoes, type AnexoChat, type PersonagemChat } from '@/lib/chat';

/** Uma mensagem como o navegador recebe do servidor. */
export type MensagemTela = {
  id: number;
  autorId: string;
  autorNome: string;
  /** Nome no Discord, quando a pessoa usa um apelido — aparece menor, pra ninguém se passar por outro. */
  autorNomeOriginal: string | null;
  autorAvatar: string | null;
  autorEhAdm: boolean;
  texto: string;
  anexos: AnexoChat[];
  criadoEm: string;
};

function hora(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
}

function Texto({ texto, personagens }: { texto: string; personagens: Map<string, PersonagemChat> }) {
  return (
    <>
      {segmentarMencoes(texto, personagens).map((s, i) =>
        s.tipo === 'texto' ? (
          <span key={i}>{s.texto}</span>
        ) : (
          <Link
            key={i}
            href={`/elenco/${s.id}/`}
            style={{ color: s.cor, borderColor: `${s.cor}66` }}
            className="rounded-[2px] border-b font-bold hover:underline"
            title={`Ver ${s.nome}`}
          >
            @{s.nome}
          </Link>
        ),
      )}
    </>
  );
}

export function MensagemChat({
  m, personagens, podeApagar, aoApagar,
}: {
  m: MensagemTela;
  personagens: Map<string, PersonagemChat>;
  podeApagar: boolean;
  aoApagar: (id: number) => void;
}) {
  return (
    <li className="flex gap-2 px-3 py-1.5">
      <Link href={`/u/${m.autorId}/`} className="shrink-0" aria-label={`Perfil de ${m.autorNome}`}>
        {m.autorAvatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={m.autorAvatar} alt="" className="h-8 w-8 rounded-full border border-line object-cover object-top" />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-line font-mono text-[12px] text-dim">
            {m.autorNome.slice(0, 1).toUpperCase()}
          </span>
        )}
      </Link>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-baseline gap-x-1.5 leading-tight">
          <Link href={`/u/${m.autorId}/`} className="truncate text-[13px] font-bold text-[#F2F2F5] hover:underline">{m.autorNome}</Link>
          {m.autorNomeOriginal && <span className="truncate font-mono text-[9px] text-dim" title="Nome no Discord">({m.autorNomeOriginal})</span>}
          {m.autorEhAdm && <span className="rounded-[2px] border border-amber px-1 font-mono text-[8px] tracking-[.1em] text-amber">ADM</span>}
          <span className="font-mono text-[9px] text-dim">{hora(m.criadoEm)}</span>
          {podeApagar && (
            <button
              type="button"
              onClick={() => aoApagar(m.id)}
              aria-label="Apagar mensagem"
              className="ml-auto font-mono text-[9px] text-dim hover:text-alerta"
            >
              apagar
            </button>
          )}
        </p>
        {m.texto && (
          <p className="whitespace-pre-wrap break-words text-[13px] leading-snug text-[#D6D6E0]">
            <Texto texto={m.texto} personagens={personagens} />
          </p>
        )}
        {m.anexos.map((a) =>
          a.tipo === 'video' ? (
            <div key={a.url} className="mt-1">
              <video controls preload="metadata" playsInline src={a.url} className="max-h-56 max-w-full rounded-[3px] border border-line bg-black" />
              {a.duracaoSegundos !== null && <p className="font-mono text-[9px] text-dim">vídeo · {formatarSegundos(a.duracaoSegundos)}</p>}
            </div>
          ) : (
            <a key={a.url} href={a.url} target="_blank" rel="noreferrer" className="mt-1 block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.url} alt="Imagem enviada no chat" loading="lazy" className="max-h-56 max-w-full rounded-[3px] border border-line object-contain" />
            </a>
          ),
        )}
      </div>
    </li>
  );
}
