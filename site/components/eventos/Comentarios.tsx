'use client';

import { useState } from 'react';

export type ComentarioExibido = {
  id: number;
  discordId: string;
  texto: string;
  criadoEm: string;
  autorNome: string;
  autorAvatar: string | null;
};

export function Comentarios({
  eventoId, comentarios, discordIdAtual, souAdm, aoComentar, aoRemover,
}: {
  eventoId: string;
  comentarios: ComentarioExibido[];
  discordIdAtual: string | null;
  souAdm: boolean;
  aoComentar: (eventoId: string, texto: string) => Promise<void>;
  aoRemover: (eventoId: string, comentarioId: number) => Promise<void>;
}) {
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [removendoId, setRemovendoId] = useState<number | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      await aoComentar(eventoId, texto);
      setTexto('');
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não deu para enviar. Tenta de novo?');
    } finally {
      setEnviando(false);
    }
  }

  async function remover(id: number) {
    setErro(null);
    setRemovendoId(id);
    try {
      await aoRemover(eventoId, id);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não deu para apagar. Tenta de novo?');
    } finally {
      setRemovendoId(null);
    }
  }

  return (
    <section className="mt-8 border-t border-line pt-6">
      <h2 className="mb-3 font-mono text-[9px] tracking-[.14em] text-dim">
        COMENTÁRIOS {comentarios.length > 0 && `(${comentarios.length})`}
      </h2>

      {erro && <p role="alert" className="mb-2 font-mono text-[9px] text-alerta">{erro}</p>}

      {comentarios.length === 0 ? (
        <p className="mb-4 text-[11px] text-dim">Ninguém comentou ainda.</p>
      ) : (
        <ul className="mb-4 space-y-3">
          {comentarios.map((c) => (
            <li key={c.id} className="flex gap-2 rounded-[4px] border border-line bg-sur p-3">
              {c.autorAvatar && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.autorAvatar} alt="" className="h-8 w-8 shrink-0 rounded-full" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <a
                    href={`/u/${c.discordId}/`}
                    className="text-[11px] font-bold text-[#D6D6E0] hover:text-cyber-cyan hover:underline"
                  >
                    {c.autorNome}
                  </a>
                  <span className="font-mono text-[8px] text-dim">
                    {new Date(c.criadoEm).toLocaleString('pt-BR', {
                      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="mt-1 whitespace-pre-line text-[12px] leading-relaxed text-[#C8C8D4]">
                  {c.texto}
                </p>
                {(c.discordId === discordIdAtual || souAdm) && (
                  <button
                    type="button"
                    onClick={() => remover(c.id)}
                    disabled={removendoId === c.id}
                    className="mt-1 font-mono text-[8px] text-dim hover:text-alerta disabled:opacity-60"
                  >
                    {removendoId === c.id ? 'apagando…' : 'apagar'}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {discordIdAtual ? (
        <form onSubmit={enviar}>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escreva um comentário…"
            maxLength={1000}
            rows={3}
            className="w-full max-w-lg rounded-[3px] border border-line bg-[#141419] px-2 py-1.5 text-[12px] text-[#D6D6E0] placeholder:text-dim/60 focus:border-alter-green focus:outline-none"
          />
          <div>
            <button
              type="submit"
              disabled={enviando || !texto.trim()}
              className="mt-2 rounded-[3px] border-2 border-alter-green bg-ego-escuro px-3 py-1.5 font-mono text-[10px] tracking-[.1em] text-[#D6D6E0] hover:bg-alter-green hover:text-[#08090D] disabled:opacity-60"
            >
              {enviando ? 'Enviando…' : 'Comentar'}
            </button>
          </div>
        </form>
      ) : (
        <p className="font-mono text-[9px] text-dim">
          <a href="/conta/" className="text-alter-green hover:underline">Entra com o Discord</a> pra comentar.
        </p>
      )}
    </section>
  );
}
