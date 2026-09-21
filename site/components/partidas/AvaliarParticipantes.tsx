'use client';

import { useState } from 'react';
import { desembrulhar, mensagemDeErro, type Acao } from '@/lib/acao-cliente';
import { COMENTARIO_MAX, COMENTARIO_MIN } from '@/lib/estrelas';
import { Estrelas } from '@/components/perfil/Estrelas';

export type ParticipanteAvaliavel = {
  discordId: string;
  nome: string;
  /** Média e total das avaliações que essa pessoa recebeu NESTA partida. */
  media: number | null;
  total: number;
  minhaEstrelas: number | null;
  meuComentario: string;
};

/** Seletor de 0 a 5 estrelas. O 0 é um botão à parte: com estrelas só, não
 * haveria como dar nota zero. */
function SeletorEstrelas({
  valor, aoEscolher, desabilitado,
}: { valor: number | null; aoEscolher: (n: number) => void; desabilitado: boolean }) {
  return (
    <div role="radiogroup" aria-label="Nota de 0 a 5 estrelas" className="flex items-center gap-0.5">
      <button
        type="button"
        role="radio"
        aria-checked={valor === 0}
        aria-label="0 estrelas"
        disabled={desabilitado}
        onClick={() => aoEscolher(0)}
        className={`mr-1 rounded-[2px] border px-1.5 py-0.5 font-mono text-[10px] ${
          valor === 0 ? 'border-execution-pink bg-execution-pink/15 text-execution-pink' : 'border-line text-dim hover:border-execution-pink/60'
        }`}
      >
        0
      </button>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={valor === n}
          aria-label={`${n} ${n === 1 ? 'estrela' : 'estrelas'}`}
          disabled={desabilitado}
          onClick={() => aoEscolher(n)}
          className={`px-0.5 text-[22px] leading-none transition-colors ${
            valor !== null && n <= valor ? 'text-amber' : 'text-neutral-700 hover:text-amber/60'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export function AvaliarParticipantes({
  partidaId, participantes, aoAvaliar, aoRemover,
}: {
  partidaId: number;
  participantes: ParticipanteAvaliavel[];
  aoAvaliar: (partidaId: number, avaliadoDiscordId: string, estrelas: number, comentario: string | null) => Acao;
  aoRemover: (partidaId: number, avaliadoDiscordId: string) => Acao;
}) {
  const [estrelas, setEstrelas] = useState<Record<string, number | null>>(
    Object.fromEntries(participantes.map((p) => [p.discordId, p.minhaEstrelas])),
  );
  const [comentarios, setComentarios] = useState<Record<string, string>>(
    Object.fromEntries(participantes.map((p) => [p.discordId, p.meuComentario])),
  );
  const [carregando, setCarregando] = useState<string | null>(null);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [salvos, setSalvos] = useState<Record<string, boolean>>({});

  const definir = <T,>(setter: (fn: (a: Record<string, T>) => Record<string, T>) => void, id: string, valor: T) =>
    setter((atual) => ({ ...atual, [id]: valor }));

  async function enviar(p: ParticipanteAvaliavel) {
    const nota = estrelas[p.discordId];
    definir(setErros, p.discordId, '');
    if (nota === null || nota === undefined) {
      definir(setErros, p.discordId, 'Escolha a nota de 0 a 5 estrelas.');
      return;
    }
    setCarregando(p.discordId);
    try {
      await desembrulhar(aoAvaliar(partidaId, p.discordId, nota, comentarios[p.discordId] ?? ''));
      definir(setSalvos, p.discordId, true);
    } catch (err) {
      definir(setErros, p.discordId, mensagemDeErro(err, 'Não deu para salvar. Tenta de novo?'));
    } finally {
      setCarregando(null);
    }
  }

  async function apagar(p: ParticipanteAvaliavel) {
    definir(setErros, p.discordId, '');
    setCarregando(p.discordId);
    try {
      await desembrulhar(aoRemover(partidaId, p.discordId));
      definir(setEstrelas, p.discordId, null);
      definir(setComentarios, p.discordId, '');
      definir(setSalvos, p.discordId, false);
    } catch (err) {
      definir(setErros, p.discordId, mensagemDeErro(err, 'Não deu para apagar. Tenta de novo?'));
    } finally {
      setCarregando(null);
    }
  }

  if (participantes.length === 0) return null;

  return (
    <section className="mb-6">
      <h2 className="mb-1 font-mono text-[9px] tracking-[.14em] text-dim">AVALIAR PARTICIPANTES</h2>
      <p className="mb-2 text-[11px] text-dim">
        Dê uma nota de 0 a 5 estrelas e escreva o porquê — o texto é obrigatório. A avaliação é anônima: a pessoa não vê quem escreveu.
      </p>
      <ul className="space-y-2">
        {participantes.map((p) => {
          const ocupado = carregando === p.discordId;
          const texto = comentarios[p.discordId] ?? '';
          const jaAvaliei = p.minhaEstrelas !== null;
          return (
            <li key={p.discordId} className="rounded-[4px] border border-line bg-sur p-2.5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <a href={`/u/${p.discordId}/`} className="text-[12px] font-bold text-[#D6D6E0] hover:text-cyber-cyan hover:underline">
                  {p.nome}
                </a>
                {p.media !== null && (
                  <span className="flex items-center gap-1.5 font-mono text-[9px] text-dim">
                    <Estrelas valor={p.media} className="text-[10px]" />
                    {p.media.toString().replace('.', ',')} ({p.total})
                  </span>
                )}
                <div className="ml-auto">
                  <SeletorEstrelas
                    valor={estrelas[p.discordId] ?? null}
                    desabilitado={ocupado}
                    aoEscolher={(n) => { definir(setEstrelas, p.discordId, n); definir(setSalvos, p.discordId, false); }}
                  />
                </div>
              </div>

              <textarea
                value={texto}
                onChange={(e) => { definir(setComentarios, p.discordId, e.target.value); definir(setSalvos, p.discordId, false); }}
                rows={2}
                maxLength={COMENTARIO_MAX}
                aria-label={`Avaliação escrita sobre ${p.nome}`}
                placeholder={`Escreva sua avaliação (mín. ${COMENTARIO_MIN} caracteres): como foi jogar com essa pessoa?`}
                className="mt-2 w-full rounded-[3px] border border-line bg-[#141419] px-2 py-1.5 text-[11px] leading-relaxed text-[#D6D6E0] placeholder:text-dim/60 focus:border-alter-green focus:outline-none"
              />

              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={ocupado}
                  onClick={() => void enviar(p)}
                  className="rounded-[3px] border border-alter-green px-2.5 py-1 font-mono text-[10px] text-alter-green hover:bg-alter-green hover:text-[#08090D] disabled:opacity-60"
                >
                  {ocupado ? 'Enviando…' : jaAvaliei ? 'Atualizar avaliação' : 'Enviar avaliação'}
                </button>
                {jaAvaliei && (
                  <button
                    type="button"
                    disabled={ocupado}
                    onClick={() => void apagar(p)}
                    className="font-mono text-[9px] text-dim hover:text-alerta disabled:opacity-60"
                  >
                    apagar a minha
                  </button>
                )}
                {salvos[p.discordId] && <span role="status" className="font-mono text-[9px] text-alter-green">Avaliação salva.</span>}
                <span className="ml-auto font-mono text-[9px] text-dim">{texto.trim().length}/{COMENTARIO_MAX}</span>
              </div>
              {erros[p.discordId] && <p role="alert" className="mt-1 font-mono text-[9px] text-alerta">{erros[p.discordId]}</p>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
