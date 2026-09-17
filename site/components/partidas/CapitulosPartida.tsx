'use client';

import { useState } from 'react';

export type CapituloLinha = {
  numero: number;
  assassinoDiscordId: string | null;
  vitimaDiscordId: string | null;
  afk: string[];
};

type Participante = { discordId: string; nome: string };

function NovoCapituloForm({
  partidaId, proximoNumero, participantes, aoSalvar,
}: {
  partidaId: number;
  proximoNumero: number;
  participantes: Participante[];
  aoSalvar: (partidaId: number, dados: {
    numero: number; assassinoDiscordId: string | null; vitimaDiscordId: string | null; afk: string[];
  }) => Promise<void>;
}) {
  const [numero, setNumero] = useState(proximoNumero);
  const [assassino, setAssassino] = useState('');
  const [vitima, setVitima] = useState('');
  const [afk, setAfk] = useState<string[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function alternarAfk(discordId: string) {
    setAfk((atual) => (atual.includes(discordId) ? atual.filter((id) => id !== discordId) : [...atual, discordId]));
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSalvando(true);
    try {
      await aoSalvar(partidaId, {
        numero, assassinoDiscordId: assassino || null, vitimaDiscordId: vitima || null, afk,
      });
      setNumero(numero + 1);
      setAssassino('');
      setVitima('');
      setAfk([]);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não deu para salvar. Tenta de novo?');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={salvar} className="mt-2 space-y-2 rounded-[3px] border border-line bg-[#0E0E13] p-2.5">
      {erro && <p role="alert" className="font-mono text-[9px] text-alerta">{erro}</p>}

      <label className="flex items-center gap-2">
        <span className="font-mono text-[8px] tracking-[.1em] text-dim">CAPÍTULO Nº</span>
        <input
          type="number"
          min={1}
          value={numero}
          onChange={(e) => setNumero(Number(e.target.value))}
          className="w-16 rounded-[3px] border border-line bg-[#141419] px-1.5 py-1 text-[11px] text-[#D6D6E0] focus:border-cyber-cyan focus:outline-none"
        />
      </label>

      <label className="block">
        <span className="mb-1 block font-mono text-[8px] tracking-[.1em] text-dim">ASSASSINO</span>
        <select
          value={assassino}
          onChange={(e) => setAssassino(e.target.value)}
          className="w-full max-w-xs rounded-[3px] border border-line bg-[#141419] px-2 py-1 text-[10px] text-[#D6D6E0] focus:border-cyber-cyan focus:outline-none"
        >
          <option value="">Ninguém matou neste capítulo</option>
          {participantes.map((p) => <option key={p.discordId} value={p.discordId}>{p.nome}</option>)}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block font-mono text-[8px] tracking-[.1em] text-dim">VÍTIMA</span>
        <select
          value={vitima}
          onChange={(e) => setVitima(e.target.value)}
          className="w-full max-w-xs rounded-[3px] border border-line bg-[#141419] px-2 py-1 text-[10px] text-[#D6D6E0] focus:border-cyber-cyan focus:outline-none"
        >
          <option value="">Ninguém morreu neste capítulo</option>
          {participantes.map((p) => <option key={p.discordId} value={p.discordId}>{p.nome}</option>)}
        </select>
      </label>

      <div>
        <span className="mb-1 block font-mono text-[8px] tracking-[.1em] text-dim">FICOU AFK / CAIU</span>
        <div className="flex flex-wrap gap-1">
          {participantes.map((p) => (
            <button
              key={p.discordId}
              type="button"
              onClick={() => alternarAfk(p.discordId)}
              className={`rounded-[2px] border px-1.5 py-0.5 font-mono text-[8px] ${
                afk.includes(p.discordId)
                  ? 'border-amber bg-amber/10 text-amber'
                  : 'border-line text-dim hover:border-amber/50'
              }`}
            >
              {p.nome}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={salvando}
        className="rounded-[3px] border border-cyber-cyan/60 px-2.5 py-1 font-mono text-[9px] text-cyber-cyan hover:bg-cyber-cyan/10 disabled:opacity-60"
      >
        {salvando ? 'Salvando…' : `Salvar capítulo ${numero}`}
      </button>
    </form>
  );
}

export function CapitulosPartida({
  partidaId, capitulos, participantes, editavel, aoSalvar, aoRemover,
}: {
  partidaId: number;
  capitulos: CapituloLinha[];
  participantes: Participante[];
  editavel: boolean;
  aoSalvar: (partidaId: number, dados: {
    numero: number; assassinoDiscordId: string | null; vitimaDiscordId: string | null; afk: string[];
  }) => Promise<void>;
  aoRemover: (partidaId: number, numero: number) => Promise<void>;
}) {
  const nomePorId = new Map(participantes.map((p) => [p.discordId, p.nome]));
  const proximoNumero = capitulos.length > 0 ? Math.max(...capitulos.map((c) => c.numero)) + 1 : 1;

  if (!editavel && capitulos.length === 0) return null;

  return (
    <section className="mb-6 max-w-2xl">
      <h2 className="mb-2 font-mono text-[9px] tracking-[.14em] text-dim">CAPÍTULOS</h2>

      {capitulos.length > 0 && (
        <ul className="space-y-2">
          {capitulos.map((c) => (
            <li key={c.numero} className="rounded-[3px] border border-line bg-sur p-2.5 text-[11px] text-[#C8C8D4]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] font-bold text-cyber-cyan">CAPÍTULO {c.numero}</span>
                {editavel && (
                  <button
                    type="button"
                    onClick={() => aoRemover(partidaId, c.numero)}
                    className="font-mono text-[8px] text-dim hover:text-alerta"
                  >
                    apagar
                  </button>
                )}
              </div>
              <p className="mt-1">
                {c.assassinoDiscordId
                  ? <>assassino: <b className="text-execution-pink">{nomePorId.get(c.assassinoDiscordId) ?? 'alguém'}</b></>
                  : 'sem assassinato revelado'}
                {c.vitimaDiscordId && <> · vítima: <b>{nomePorId.get(c.vitimaDiscordId) ?? 'alguém'}</b></>}
              </p>
              {c.afk.length > 0 && (
                <p className="mt-0.5 font-mono text-[9px] text-amber">
                  AFK: {c.afk.map((id) => nomePorId.get(id) ?? id).join(', ')}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      {editavel && (
        <NovoCapituloForm
          partidaId={partidaId}
          proximoNumero={proximoNumero}
          participantes={participantes}
          aoSalvar={aoSalvar}
        />
      )}
    </section>
  );
}
