'use client';

import { useState } from 'react';
import { FormularioPartida } from './FormularioPartida';
import { RelatorioPartida } from './RelatorioPartida';
import { desembrulhar, mensagemDeErro, type Acao } from '@/lib/acao-cliente';
import type { StatusPartida } from '@/lib/status-partida';

type Resultado = 'vitoria_alunos' | 'vitoria_mestre' | 'tragedia';

const AVISO: Partial<Record<StatusPartida, string>> = {
  em_andamento: 'Começar agora? A inscrição fecha e o cronômetro da partida dispara.',
  finalizada: 'Finalizar a partida? O cronômetro para e a duração fica registrada.',
  cancelada: 'Cancelar esta partida? Não dá pra desfazer.',
};

export function ControlesHost({
  partidaId, inicial, status, participantes, relatorioInicial, aoAtualizar, aoMudarStatus, aoSalvarRelatorio,
}: {
  partidaId: number;
  inicial: { titulo: string; dataHora: string; regras: string; capaUrl: string; vagas: number };
  status: StatusPartida;
  participantes: { discordId: string; nome: string }[];
  relatorioInicial: { capitulo: string; blackened: string; mvpDiscordIds: string[]; resultado: Resultado | null };
  aoAtualizar: (partidaId: number, dados: { titulo: string; dataHora: string; regras: string | null; capaUrl: string | null; vagas: number }) => Acao;
  aoMudarStatus: (partidaId: number, status: StatusPartida) => Acao;
  aoSalvarRelatorio: (partidaId: number, dados: {
    capitulo: string | null; blackened: string | null; mvpDiscordIds: string[]; resultado: Resultado | null;
  }) => Promise<void>;
}) {
  const [aberto, setAberto] = useState(false);
  const [relatorioAberto, setRelatorioAberto] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function mudar(novo: StatusPartida) {
    if (!confirm(AVISO[novo] ?? `Marcar esta partida como ${novo}?`)) return;
    setErro(null);
    setCarregando(true);
    try {
      await desembrulhar(aoMudarStatus(partidaId, novo));
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não deu para mudar o status. Tenta de novo?'));
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="mt-6 rounded-[4px] border border-execution-pink/30 bg-execution-pink/5 p-3">
      <p className="mb-3 font-mono text-[9px] tracking-[.1em] text-execution-pink">
        [ VOCÊ É O HOST ]
      </p>
      {erro && <p role="alert" className="mb-2 font-mono text-[10px] text-alerta">{erro}</p>}

      {status === 'agendada' && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={carregando}
            onClick={() => void mudar('em_andamento')}
            className="rounded-[3px] border-2 border-alter-green bg-alter-green/10 px-3 py-1.5 font-mono text-[11px] font-bold tracking-[.08em] text-alter-green hover:bg-alter-green hover:text-[#08090D] disabled:opacity-60"
          >
            ▶ Começar partida
          </button>
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
            onClick={() => void mudar('cancelada')}
            className="rounded-[3px] border border-alerta/50 px-2.5 py-1 font-mono text-[9px] text-alerta hover:bg-alerta/10 disabled:opacity-60"
          >
            Cancelar partida
          </button>
        </div>
      )}

      {status === 'em_andamento' && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={carregando}
            onClick={() => void mudar('finalizada')}
            className="rounded-[3px] border-2 border-execution-pink bg-execution-pink/10 px-3 py-1.5 font-mono text-[11px] font-bold tracking-[.08em] text-execution-pink hover:bg-execution-pink hover:text-[#08090D] disabled:opacity-60"
          >
            ■ Finalizar partida
          </button>
          <button
            type="button"
            disabled={carregando}
            onClick={() => void mudar('cancelada')}
            className="rounded-[3px] border border-alerta/50 px-2.5 py-1 font-mono text-[9px] text-alerta hover:bg-alerta/10 disabled:opacity-60"
          >
            Cancelar partida
          </button>
        </div>
      )}

      {aberto && status === 'agendada' && (
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
