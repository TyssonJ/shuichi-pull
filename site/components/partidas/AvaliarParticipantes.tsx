'use client';

import { useState } from 'react';

export type ParticipanteAvaliavel = {
  discordId: string;
  nome: string;
  likes: number;
  dislikes: number;
  minhaAvaliacao: 'like' | 'dislike' | null;
  meuComentario: string;
};

export function AvaliarParticipantes({
  partidaId, participantes, aoAvaliar, aoRemover,
}: {
  partidaId: number;
  participantes: ParticipanteAvaliavel[];
  aoAvaliar: (partidaId: number, avaliadoDiscordId: string, tipo: 'like' | 'dislike', comentario: string | null) => Promise<void>;
  aoRemover: (partidaId: number, avaliadoDiscordId: string) => Promise<void>;
}) {
  const [comentarios, setComentarios] = useState<Record<string, string>>(
    Object.fromEntries(participantes.map((p) => [p.discordId, p.meuComentario])),
  );
  const [carregando, setCarregando] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function avaliar(avaliadoDiscordId: string, tipo: 'like' | 'dislike') {
    setErro(null);
    setCarregando(avaliadoDiscordId);
    try {
      const jaEra = participantes.find((p) => p.discordId === avaliadoDiscordId)?.minhaAvaliacao;
      if (jaEra === tipo) {
        await aoRemover(partidaId, avaliadoDiscordId);
      } else {
        await aoAvaliar(partidaId, avaliadoDiscordId, tipo, comentarios[avaliadoDiscordId] ?? null);
      }
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não deu para salvar. Tenta de novo?');
    } finally {
      setCarregando(null);
    }
  }

  if (participantes.length === 0) return null;

  return (
    <section className="mb-6">
      <h2 className="mb-2 font-mono text-[9px] tracking-[.14em] text-dim">AVALIAR PARTICIPANTES</h2>
      {erro && <p role="alert" className="mb-2 font-mono text-[9px] text-alerta">{erro}</p>}
      <ul className="space-y-2">
        {participantes.map((p) => (
          <li key={p.discordId} className="rounded-[4px] border border-line bg-sur p-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <a href={`/u/${p.discordId}/`} className="text-[12px] font-bold text-[#D6D6E0] hover:text-cyber-cyan hover:underline">
                {p.nome}
              </a>
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  disabled={carregando === p.discordId}
                  onClick={() => avaliar(p.discordId, 'like')}
                  aria-pressed={p.minhaAvaliacao === 'like'}
                  className={`rounded-[3px] border px-2 py-0.5 font-mono text-[9px] disabled:opacity-60 ${
                    p.minhaAvaliacao === 'like'
                      ? 'border-alter-green bg-alter-green/10 text-alter-green'
                      : 'border-line text-dim hover:border-alter-green/50'
                  }`}
                >
                  [+] gostei {p.likes > 0 && `(${p.likes})`}
                </button>
                <button
                  type="button"
                  disabled={carregando === p.discordId}
                  onClick={() => avaliar(p.discordId, 'dislike')}
                  aria-pressed={p.minhaAvaliacao === 'dislike'}
                  className={`rounded-[3px] border px-2 py-0.5 font-mono text-[9px] disabled:opacity-60 ${
                    p.minhaAvaliacao === 'dislike'
                      ? 'border-alerta bg-alerta/10 text-alerta'
                      : 'border-line text-dim hover:border-alerta/50'
                  }`}
                >
                  [-] não gostei {p.dislikes > 0 && `(${p.dislikes})`}
                </button>
              </div>
            </div>
            {p.minhaAvaliacao && (
              <input
                value={comentarios[p.discordId] ?? ''}
                onChange={(e) => setComentarios((c) => ({ ...c, [p.discordId]: e.target.value }))}
                onBlur={() => aoAvaliar(partidaId, p.discordId, p.minhaAvaliacao!, comentarios[p.discordId] ?? null)}
                placeholder="comentário breve sobre a interpretação (opcional)…"
                className="mt-2 w-full rounded-[3px] border border-line bg-[#141419] px-2 py-1 text-[10px] text-[#D6D6E0] placeholder:text-dim/60 focus:border-alter-green focus:outline-none"
              />
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
