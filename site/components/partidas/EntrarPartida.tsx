'use client';

import { useState } from 'react';

type Personagem = { id: string; nome: string };

export function EntrarPartida({
  partidaId, personagemAtual, personagens, aoEntrar, aoSair,
}: {
  partidaId: number;
  personagemAtual: string | null;
  personagens: Personagem[];
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
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não deu certo. Tenta de novo?');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="rounded-[4px] border border-line bg-sur p-3">
      {erro && <p role="alert" className="mb-2 font-mono text-[9px] text-alerta">{erro}</p>}
      <label className="mb-2 block">
        <span className="mb-1 block font-mono text-[8px] tracking-[.1em] text-dim">
          SEU PERSONAGEM NESTA PARTIDA (opcional)
        </span>
        <select
          value={personagemId}
          onChange={(e) => setPersonagemId(e.target.value)}
          className="w-full max-w-xs rounded-[3px] border border-line bg-[#141419] px-2 py-1.5 text-[11px] text-[#D6D6E0] focus:border-alter-green focus:outline-none"
        >
          <option value="">Ainda não decidi</option>
          {personagens.map((p) => (
            <option key={p.id} value={p.id}>{p.nome}</option>
          ))}
        </select>
      </label>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={entrar}
          disabled={carregando}
          className="rounded-[3px] border-2 border-alter-green bg-ego-escuro px-3 py-1.5 font-mono text-[10px] tracking-[.1em] text-[#D6D6E0] hover:bg-alter-green hover:text-[#08090D] disabled:opacity-60"
        >
          {jaEntrou ? 'Atualizar personagem' : 'Entrar nesta partida'}
        </button>
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
