'use client';

import { useState } from 'react';

export function FormularioPartida({
  inicial, aoSalvar, textoBotao,
}: {
  inicial?: { titulo: string; dataHora: string; regras: string };
  aoSalvar: (dados: { titulo: string; dataHora: string; regras: string | null }) => Promise<void>;
  textoBotao: string;
}) {
  const [titulo, setTitulo] = useState(inicial?.titulo ?? '');
  const [dataHora, setDataHora] = useState(inicial?.dataHora ?? '');
  const [regras, setRegras] = useState(inicial?.regras ?? '');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSalvando(true);
    try {
      await aoSalvar({ titulo, dataHora, regras: regras.trim() || null });
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não deu para salvar. Tenta de novo?');
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={salvar} className="max-w-md space-y-4">
      {erro && <p role="alert" className="font-mono text-[10px] text-alerta">{erro}</p>}

      <label className="block">
        <span className="mb-1 block font-mono text-[9px] tracking-[.14em] text-dim">TÍTULO</span>
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ex: Trial de sábado à noite"
          required
          className="w-full rounded-[3px] border border-line bg-[#141419] px-2 py-1.5 text-[12px] text-[#D6D6E0] placeholder:text-dim/60 focus:border-alter-green focus:outline-none"
        />
      </label>

      <label className="block">
        <span className="mb-1 block font-mono text-[9px] tracking-[.14em] text-dim">DATA E HORA</span>
        <input
          type="datetime-local"
          value={dataHora}
          onChange={(e) => setDataHora(e.target.value)}
          required
          className="w-full rounded-[3px] border border-line bg-[#141419] px-2 py-1.5 font-mono text-[11px] text-[#D6D6E0] focus:border-alter-green focus:outline-none"
        />
      </label>

      <label className="block">
        <span className="mb-1 block font-mono text-[9px] tracking-[.14em] text-dim">
          REGRAS (opcional)
        </span>
        <textarea
          value={regras}
          onChange={(e) => setRegras(e.target.value)}
          rows={4}
          placeholder="Quantos jogadores, mods necessários, como resolver conflito de personagem…"
          className="w-full rounded-[3px] border border-line bg-[#141419] px-2 py-1.5 text-[12px] leading-relaxed text-[#D6D6E0] placeholder:text-dim/60 focus:border-alter-green focus:outline-none"
        />
      </label>

      <button
        type="submit"
        disabled={salvando}
        className="rounded-[3px] border-2 border-alter-green bg-ego-escuro px-3 py-1.5 font-mono text-[10px] tracking-[.1em] text-[#D6D6E0] hover:bg-alter-green hover:text-[#08090D] disabled:opacity-60"
      >
        {salvando ? 'Salvando…' : textoBotao}
      </button>
    </form>
  );
}
