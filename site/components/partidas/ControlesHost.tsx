'use client';

import { useState } from 'react';
import { FormularioPartida } from './FormularioPartida';
import { RelatorioPartida } from './RelatorioPartida';

type Resultado = 'vitoria_alunos' | 'vitoria_mestre' | 'tragedia';

export function ControlesHost({
  partidaId, inicial, status, participantes, relatorioInicial, aoAtualizar, aoMudarStatus, aoSalvarRelatorio,
}: {
  partidaId: number;
  inicial: { titulo: string; dataHora: string; regras: string; capaUrl: string };
  status: 'agendada' | 'finalizada' | 'cancelada';
  participantes: { discordId: string; nome: string }[];
  relatorioInicial: { capitulo: string; blackened: string; mvpDiscordId: string; resultado: Resultado | null };
  aoAtualizar: (partidaId: number, dados: { titulo: string; dataHora: string; regras: string | null; capaUrl: string | null }) => Promise<void>;
  aoMudarStatus: (partidaId: number, status: 'agendada' | 'finalizada' | 'cancelada') => Promise<void>;
  aoSalvarRelatorio: (partidaId: number, dados: {
    capitulo: string | null; blackened: string | null; mvpDiscordId: string | null; resultado: Resultado | null;
  }) => Promise<void>;
}) {
  const [aberto, setAberto] = useState(false);
  const [relatorioAberto, setRelatorioAberto] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function mudar(novo: 'finalizada' | 'cancelada') {
    if (!confirm(`Marcar esta partida como ${novo}?`)) return;
    setCarregando(true);
    try {
      await aoMudarStatus(partidaId, novo);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="mt-6 rounded-[4px] border border-execution-pink/30 bg-execution-pink/5 p-3">
      <p className="mb-3 font-mono text-[9px] tracking-[.1em] text-execution-pink">
        [ VOCÊ É O HOST ]
      </p>

      {status === 'agendada' && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setAberto((a) => !a)}
            className="rounded-[3px] border border-line px-2.5 py-1 font-mono text-[9px] text-[#D6D6E0] hover:border-alter-green"
          >
            {aberto ? 'Fechar edição' : 'Editar detalhes'}
          </button>
          <button
            type="button"
            disabled={carregando}
            onClick={() => mudar('finalizada')}
            className="rounded-[3px] border border-alter-green/50 px-2.5 py-1 font-mono text-[9px] text-alter-green hover:bg-alter-green/10 disabled:opacity-60"
          >
            Marcar como finalizada
          </button>
          <button
            type="button"
            disabled={carregando}
            onClick={() => mudar('cancelada')}
            className="rounded-[3px] border border-alerta/50 px-2.5 py-1 font-mono text-[9px] text-alerta hover:bg-alerta/10 disabled:opacity-60"
          >
            Cancelar partida
          </button>
        </div>
      )}

      {aberto && (
        <div className="mt-3">
          <FormularioPartida
            inicial={inicial}
            textoBotao="Salvar alterações"
            aoSalvar={(dados) => aoAtualizar(partidaId, dados)}
          />
        </div>
      )}

      {status === 'finalizada' && (
        <div>
          <button
            type="button"
            onClick={() => setRelatorioAberto((a) => !a)}
            className="rounded-[3px] border border-line px-2.5 py-1 font-mono text-[9px] text-[#D6D6E0] hover:border-cyber-cyan"
          >
            {relatorioAberto ? 'Fechar relatório' : 'Preencher relatório (AAR)'}
          </button>
          {relatorioAberto && (
            <RelatorioPartida
              partidaId={partidaId}
              participantes={participantes}
              inicial={relatorioInicial}
              aoSalvar={aoSalvarRelatorio}
            />
          )}
        </div>
      )}
    </div>
  );
}
