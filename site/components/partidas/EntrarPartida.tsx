'use client';

import { useState } from 'react';
import { ID_MONOKUMA } from '@/lib/monokuma';

type Personagem = { id: string; nome: string; sprite: string };

export function EntrarPartida({
  partidaId, personagemAtual, personagens, souHost = false, aoEntrar, aoSair,
}: {
  partidaId: number;
  personagemAtual: string | null;
  personagens: Personagem[];
  souHost?: boolean;
  aoEntrar: (partidaId: number, personagemId: string | null) => Promise<void>;
  aoSair: (partidaId: number) => Promise<void>;
}) {
  const jaEntrou = personagemAtual !== undefined && personagemAtual !== null;
  const [personagemId, setPersonagemId] = useState(personagemAtual ?? '');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function entrar() {
    setErro(null);
    setCarregando(true);
    try {
      await aoEntrar(partidaId, personagemId || null);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não deu certo. Tenta de novo?');
    } finally {
      setCarregando(false);
    }
  }

  async function sair() {
    setErro(null);
    setCarregando(true);
    try {
      await aoSair(partidaId);
      setPersonagemId('');
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não deu certo. Tenta de novo?');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="rounded-[4px] border border-line bg-sur p-3">
      {erro && <p role="alert" className="mb-2 font-mono text-[9px] text-alerta">{erro}</p>}

      <p className="mb-2 font-mono text-[8px] tracking-[.1em] text-dim">
        SEU PERSONAGEM NESTA PARTIDA (opcional)
      </p>
      <div className="mb-3 grid max-h-64 grid-cols-4 gap-1.5 overflow-y-auto rounded-[3px] border border-line p-2 sm:grid-cols-5">
        {souHost && (
          <button
            type="button"
            onClick={() => setPersonagemId(ID_MONOKUMA)}
            aria-pressed={personagemId === ID_MONOKUMA}
            className={`bg-hazard-tape flex flex-col items-center gap-1 rounded-[3px] border-2 p-1.5 transition-colors ${
              personagemId === ID_MONOKUMA ? 'border-execution-pink' : 'border-line'
            }`}
          >
            <span
              aria-hidden
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#0A0A0D] bg-[#F2F2F5] text-[16px]"
            >
              🐻
            </span>
            <span className="text-center font-mono text-[7px] font-bold leading-tight text-[#F2F2F5]">
              MONOKUMA
              <br />(HOST)
            </span>
          </button>
        )}

        {personagens.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPersonagemId(p.id)}
            aria-pressed={personagemId === p.id}
            className={`flex flex-col items-center gap-1 rounded-[3px] border-2 bg-[#0E0E13] p-1.5 transition-colors ${
              personagemId === p.id ? 'border-alter-green' : 'border-line hover:border-alter-green/50'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.sprite}
              alt=""
              className="h-10 w-10 object-contain"
              style={{ imageRendering: 'pixelated' }}
            />
            <span className="line-clamp-2 text-center text-[8px] leading-tight text-[#D6D6E0]">
              {p.nome}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={entrar}
          disabled={carregando}
          className="rounded-[3px] border-2 border-alter-green bg-ego-escuro px-3 py-1.5 font-mono text-[10px] tracking-[.1em] text-[#D6D6E0] hover:bg-alter-green hover:text-[#08090D] disabled:opacity-60"
        >
          {jaEntrou ? 'Atualizar personagem' : 'Entrar nesta partida'}
        </button>
        {personagemId && (
          <button
            type="button"
            onClick={() => setPersonagemId('')}
            className="font-mono text-[9px] text-dim hover:text-[#D6D6E0]"
          >
            limpar seleção
          </button>
        )}
        {jaEntrou && (
          <button
            type="button"
            onClick={sair}
            disabled={carregando}
            className="rounded-[3px] border border-alerta/50 px-3 py-1.5 font-mono text-[10px] text-alerta hover:bg-alerta/10 disabled:opacity-60"
          >
            Sair da partida
          </button>
        )}
      </div>
    </div>
  );
}
