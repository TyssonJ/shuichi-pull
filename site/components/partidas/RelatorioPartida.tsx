'use client';

import { useState } from 'react';

type Resultado = 'vitoria_alunos' | 'vitoria_mestre' | 'tragedia';

const ROTULO_RESULTADO: Record<Resultado, string> = {
  vitoria_alunos: 'Vitória dos alunos',
  vitoria_mestre: 'Vitória do mestre',
  tragedia: 'Tragédia (ninguém venceu)',
};

export function RelatorioPartida({
  partidaId, participantes, inicial, aoSalvar,
}: {
  partidaId: number;
  participantes: { discordId: string; nome: string }[];
  inicial: { capitulo: string; blackened: string; mvpDiscordId: string; resultado: Resultado | null };
  aoSalvar: (partidaId: number, dados: {
    capitulo: string | null; blackened: string | null; mvpDiscordId: string | null; resultado: Resultado | null;
  }) => Promise<void>;
}) {
  const [capitulo, setCapitulo] = useState(inicial.capitulo);
  const [blackened, setBlackened] = useState(inicial.blackened);
  const [mvpDiscordId, setMvpDiscordId] = useState(inicial.mvpDiscordId);
  const [resultado, setResultado] = useState<Resultado | ''>(inicial.resultado ?? '');
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSalvando(true);
    try {
      await aoSalvar(partidaId, {
        capitulo: capitulo.trim() || null,
        blackened: blackened || null,
        mvpDiscordId: mvpDiscordId || null,
        resultado: resultado || null,
      });
      setSalvo(true);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não deu para salvar. Tenta de novo?');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={salvar} className="mt-3 space-y-3 rounded-[4px] border border-cyber-cyan/30 bg-[#0A1218] p-3">
      {erro && <p role="alert" className="font-mono text-[10px] text-alerta">{erro}</p>}

      <label className="block">
        <span className="mb-1 block font-mono text-[9px] tracking-[.1em] text-dim">CAPÍTULO</span>
        <input
          value={capitulo}
          onChange={(e) => { setCapitulo(e.target.value); setSalvo(false); }}
          placeholder="Ex: Capítulo 1"
          className="w-full max-w-xs rounded-[3px] border border-line bg-[#141419] px-2 py-1.5 text-[11px] text-[#D6D6E0] placeholder:text-dim/60 focus:border-cyber-cyan focus:outline-none"
        />
      </label>

      <label className="block">
        <span className="mb-1 block font-mono text-[9px] tracking-[.1em] text-dim">BLACKENED (CULPADO REVELADO)</span>
        <select
          value={blackened}
          onChange={(e) => { setBlackened(e.target.value); setSalvo(false); }}
          className="w-full max-w-xs rounded-[3px] border border-line bg-[#141419] px-2 py-1.5 text-[11px] text-[#D6D6E0] focus:border-cyber-cyan focus:outline-none"
        >
          <option value="">Ninguém / não revelado</option>
          {participantes.map((p) => (
            <option key={p.discordId} value={p.discordId}>{p.nome}</option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block font-mono text-[9px] tracking-[.1em] text-dim">MVP DA PARTIDA</span>
        <select
          value={mvpDiscordId}
          onChange={(e) => { setMvpDiscordId(e.target.value); setSalvo(false); }}
          className="w-full max-w-xs rounded-[3px] border border-line bg-[#141419] px-2 py-1.5 text-[11px] text-[#D6D6E0] focus:border-cyber-cyan focus:outline-none"
        >
          <option value="">Sem MVP</option>
          {participantes.map((p) => (
            <option key={p.discordId} value={p.discordId}>{p.nome}</option>
          ))}
        </select>
      </label>

      <fieldset>
        <legend className="mb-1 font-mono text-[9px] tracking-[.1em] text-dim">STATUS DE CONCLUSÃO</legend>
        <div className="flex flex-wrap gap-3">
          {(Object.keys(ROTULO_RESULTADO) as Resultado[]).map((r) => (
            <label key={r} className="flex items-center gap-1.5 text-[11px] text-[#D6D6E0]">
              <input
                type="radio"
                name={`resultado-${partidaId}`}
                checked={resultado === r}
                onChange={() => { setResultado(r); setSalvo(false); }}
              />
              {ROTULO_RESULTADO[r]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={salvando}
          className="rounded-[3px] border-2 border-cyber-cyan bg-[#0A1218] px-3 py-1.5 font-mono text-[10px] tracking-[.1em] text-[#D6D6E0] hover:bg-cyber-cyan hover:text-[#08090D] disabled:opacity-60"
        >
          {salvando ? 'Salvando…' : 'Salvar relatório'}
        </button>
        {salvo && <span className="font-mono text-[9px] text-cyber-cyan">salvo ✓</span>}
      </div>
    </form>
  );
}
