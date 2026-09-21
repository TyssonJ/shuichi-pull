'use client';

import { useState } from 'react';
import { mensagemDeErro } from '@/lib/acao-cliente';

type Resultado = 'vitoria_alunos' | 'vitoria_mestre' | 'tragedia';

const ROTULO_RESULTADO: Record<Resultado, string> = {
  vitoria_alunos: 'Cápsulas (culpado capturado, vitória dos alunos)',
  vitoria_mestre: 'Vitória do assassino',
  tragedia: 'Sobreviventes sem resolução (tragédia)',
};

export function RelatorioPartida({
  partidaId, participantes, inicial, aoSalvar,
}: {
  partidaId: number;
  participantes: { discordId: string; nome: string }[];
  inicial: { capitulo: string; blackened: string; mvpDiscordIds: string[]; resultado: Resultado | null };
  aoSalvar: (partidaId: number, dados: {
    capitulo: string | null; blackened: string | null; mvpDiscordIds: string[]; resultado: Resultado | null;
  }) => Promise<void>;
}) {
  const [capitulo, setCapitulo] = useState(inicial.capitulo);
  const [blackened, setBlackened] = useState(inicial.blackened);
  const [mvpDiscordIds, setMvpDiscordIds] = useState<string[]>(inicial.mvpDiscordIds);
  const [resultado, setResultado] = useState<Resultado | ''>(inicial.resultado ?? '');
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function alternarMvp(discordId: string) {
    setMvpDiscordIds((atual) =>
      atual.includes(discordId) ? atual.filter((id) => id !== discordId) : [...atual, discordId]
    );
    setSalvo(false);
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSalvando(true);
    try {
      await aoSalvar(partidaId, {
        capitulo: capitulo.trim() || null,
        blackened: blackened || null,
        mvpDiscordIds,
        resultado: resultado || null,
      });
      setSalvo(true);
    } catch (err) {
      setErro(mensagemDeErro(err, 'Não deu para salvar. Tenta de novo?'));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={salvar} className="mt-3 space-y-3 rounded-[4px] border border-cyber-cyan/30 bg-[#0A1218] p-3">
      {erro && <p role="alert" className="font-mono text-[10px] text-alerta">{erro}</p>}

      <label className="block">
        <span className="mb-1 block font-mono text-[9px] tracking-[.1em] text-dim">RESUMO DO CAPÍTULO (opcional)</span>
        <input
          value={capitulo}
          onChange={(e) => { setCapitulo(e.target.value); setSalvo(false); }}
          placeholder="Ex: Capítulo 1 — resumo geral"
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

      <div>
        <span className="mb-1 block font-mono text-[9px] tracking-[.1em] text-dim">
          MVPS DA PARTIDA {mvpDiscordIds.length > 0 && `(${mvpDiscordIds.length})`}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {participantes.map((p) => {
            const ativo = mvpDiscordIds.includes(p.discordId);
            return (
              <button
                key={p.discordId}
                type="button"
                onClick={() => alternarMvp(p.discordId)}
                className={`rounded-[2px] border px-1.5 py-0.5 font-mono text-[9px] transition-colors ${
                  ativo
                    ? 'border-cyber-cyan bg-cyber-cyan/10 text-cyber-cyan'
                    : 'border-line text-dim hover:border-cyber-cyan/50'
                }`}
              >
                {p.nome}
              </button>
            );
          })}
        </div>
      </div>

      <fieldset>
        <legend className="mb-1 font-mono text-[9px] tracking-[.1em] text-dim">DESFECHO FINAL</legend>
        <div className="flex flex-col gap-1.5">
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
