'use client';

import { useState } from 'react';
import { ID_MONOKUMA, SPRITE_MONOKUMA } from '@/lib/monokuma';

/** `pixel` é o sprite 8-bit; sem ele (Ryoko Otonashi) cai no retrato `sprite`. */
type Personagem = { id: string; nome: string; sprite: string; pixel: string | null };
type Tipo = 'participante' | 'reserva';

export function EntrarPartida({
  partidaId, personagemAtual, tipoAtual, personagens, souHost = false, aoEntrar, aoSair,
}: {
  partidaId: number;
  personagemAtual: string | null;
  tipoAtual?: Tipo;
  personagens: Personagem[];
  souHost?: boolean;
  aoEntrar: (partidaId: number, personagemId: string | null, tipo: Tipo) => Promise<void>;
  aoSair: (partidaId: number) => Promise<void>;
}) {
  const jaEntrou = personagemAtual !== undefined && personagemAtual !== null;
  const [personagemId, setPersonagemId] = useState(personagemAtual ?? '');
  const [monokumaFlash, setMonokumaFlash] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function selecionar(id: string) {
    setPersonagemId(id);
    if (id === ID_MONOKUMA) {
      setMonokumaFlash(true);
      setTimeout(() => setMonokumaFlash(false), 500);
    }
  }

  async function entrar(tipo: Tipo) {
    setErro(null);
    setCarregando(true);
    try {
      await aoEntrar(partidaId, personagemId || null, tipo);
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
    <div className="relative rounded-[4px] border border-line bg-sur p-3">
      {monokumaFlash && (
        <div
          aria-hidden
          className="animate-monokuma-flash pointer-events-none fixed inset-0 z-[100]"
          style={{
            background: 'repeating-linear-gradient(45deg, #FF007F 0 8px, #0A0A0D 8px 16px)',
          }}
        />
      )}

      {erro && <p role="alert" className="mb-2 font-mono text-[9px] text-alerta">{erro}</p>}

      <p className="mb-2 font-mono text-[8px] tracking-[.1em] text-dim">
        SEU PERSONAGEM NESTA PARTIDA (opcional — deixe em branco pra vaga genérica)
      </p>
      <div className="mb-3 grid max-h-64 grid-cols-4 gap-1.5 overflow-y-auto rounded-[3px] border border-line p-2 sm:grid-cols-5">
        {souHost && (
          <button
            type="button"
            onClick={() => selecionar(ID_MONOKUMA)}
            aria-pressed={personagemId === ID_MONOKUMA}
            className={`bg-hazard-tape flex flex-col items-center gap-1 rounded-[3px] border-2 p-1.5 transition-colors ${
              personagemId === ID_MONOKUMA ? 'border-execution-pink animate-monokuma-glitch' : 'border-line'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={SPRITE_MONOKUMA}
              alt=""
              className="h-10 w-10 border-2 border-[#0A0A0D] object-contain"
              style={{ imageRendering: 'pixelated' }}
            />
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
            onClick={() => selecionar(p.id)}
            aria-pressed={personagemId === p.id}
            className={`flex flex-col items-center gap-1 rounded-[3px] border-2 bg-[#0E0E13] p-1.5 transition-colors ${
              personagemId === p.id ? 'border-alter-green' : 'border-line hover:border-alter-green/50'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.pixel ?? p.sprite}
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
          onClick={() => entrar('participante')}
          disabled={carregando}
          className={`rounded-[3px] border-2 px-3 py-1.5 font-mono text-[10px] tracking-[.1em] disabled:opacity-60 ${
            jaEntrou && tipoAtual === 'participante'
              ? 'border-alter-green bg-alter-green text-[#08090D]'
              : 'border-alter-green bg-ego-escuro text-[#D6D6E0] hover:bg-alter-green hover:text-[#08090D]'
          }`}
        >
          {jaEntrou ? 'Atualizar como participante' : 'Entrar como participante'}
        </button>
        <button
          type="button"
          onClick={() => entrar('reserva')}
          disabled={carregando}
          className={`rounded-[3px] border-2 px-3 py-1.5 font-mono text-[10px] tracking-[.1em] disabled:opacity-60 ${
            jaEntrou && tipoAtual === 'reserva'
              ? 'border-amber bg-amber text-[#08090D]'
              : 'border-amber/60 text-amber hover:bg-amber/10'
          }`}
        >
          {jaEntrou ? 'Atualizar como reserva' : 'Entrar como reserva'}
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
