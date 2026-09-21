'use client';

import { useState } from 'react';
import { VAGAS_MAX, VAGAS_MIN, VAGAS_PADRAO } from '@/lib/vagas';
import { ROTULO_FUSO } from '@/lib/fuso';
import { desembrulhar, type Acao, mensagemDeErro } from '@/lib/acao-cliente';

export function FormularioPartida({
  inicial, aoSalvar, textoBotao,
}: {
  inicial?: { titulo: string; dataHora: string; regras: string; capaUrl: string; vagas: number };
  aoSalvar: (dados: { titulo: string; dataHora: string; regras: string | null; capaUrl: string | null; vagas: number }) => Acao;
  textoBotao: string;
}) {
  const [titulo, setTitulo] = useState(inicial?.titulo ?? '');
  const [dataHora, setDataHora] = useState(inicial?.dataHora ?? '');
  const [regras, setRegras] = useState(inicial?.regras ?? '');
  const [capaUrl, setCapaUrl] = useState(inicial?.capaUrl ?? '');
  const [vagas, setVagas] = useState(String(inicial?.vagas ?? VAGAS_PADRAO));
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSalvando(true);
    try {
      await desembrulhar(aoSalvar({
        titulo, dataHora, regras: regras.trim() || null, capaUrl: capaUrl.trim() || null,
        vagas: Number(vagas),
      }));
    } catch (err) {
      setErro(mensagemDeErro(err, 'Não deu para salvar. Tenta de novo?'));
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
        <span className="mb-1 block font-mono text-[9px] tracking-[.14em] text-dim">DATA E HORA ({ROTULO_FUSO.toUpperCase()})</span>
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
          VAGAS DE TITULAR ({VAGAS_MIN}–{VAGAS_MAX})
        </span>
        <input
          type="number"
          min={VAGAS_MIN}
          max={VAGAS_MAX}
          value={vagas}
          onChange={(e) => setVagas(e.target.value)}
          required
          className="w-24 rounded-[3px] border border-line bg-[#141419] px-2 py-1.5 font-mono text-[12px] text-[#D6D6E0] focus:border-alter-green focus:outline-none"
        />
        <span className="mt-1 block text-[10px] text-dim">
          Reservas não ocupam vaga (nem o host, se ele quiser jogar de Monokuma). O Shinri Trial padrão tem 16.
        </span>
      </label>

      <label className="block">
        <span className="mb-1 block font-mono text-[9px] tracking-[.14em] text-dim">
          IMAGEM DE CAPA (opcional, URL)
        </span>
        <input
          value={capaUrl}
          onChange={(e) => setCapaUrl(e.target.value)}
          placeholder="https://…"
          className="w-full rounded-[3px] border border-line bg-[#141419] px-2 py-1.5 text-[12px] text-[#D6D6E0] placeholder:text-dim/60 focus:border-alter-green focus:outline-none"
        />
        {capaUrl.trim() && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={capaUrl} alt="" className="mt-2 h-24 w-full rounded-[3px] border border-line object-cover" />
        )}
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
