'use client';

import { useState } from 'react';

const ROTULO_STATUS: Record<string, string> = {
  agendada: 'AGENDADA', finalizada: 'FINALIZADA', cancelada: 'CANCELADA',
};

export function CartaoPartida({
  partidaId, titulo, hostNome, dataHora, status, totalParticipantes,
  aoCancelar, aoTransferirHost,
}: {
  partidaId: number;
  titulo: string;
  hostNome: string;
  dataHora: string;
  status: 'agendada' | 'finalizada' | 'cancelada';
  totalParticipantes: number;
  aoCancelar: (partidaId: number) => Promise<void>;
  aoTransferirHost: (partidaId: number, novoHostDiscordId: string) => Promise<void>;
}) {
  const [novoHost, setNovoHost] = useState('');
  const [aberto, setAberto] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function cancelar() {
    if (!confirm(`Cancelar "${titulo}"? Isso não pode ser desfeito pelo host.`)) return;
    setCarregando(true);
    try {
      await aoCancelar(partidaId);
    } finally {
      setCarregando(false);
    }
  }

  async function transferir() {
    setErro(null);
    setCarregando(true);
    try {
      await aoTransferirHost(partidaId, novoHost);
      setNovoHost('');
      setAberto(false);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não deu certo.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="rounded border border-neutral-800 bg-neutral-900 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <a href={`/partidas/${partidaId}/`} target="_blank" rel="noreferrer" className="font-bold hover:underline">
          {titulo}
        </a>
        <span className={`rounded px-1.5 py-0.5 text-[10px] uppercase ${
          status === 'agendada' ? 'bg-green-900 text-green-300'
          : status === 'finalizada' ? 'bg-cyan-900 text-cyan-300'
          : 'bg-red-900 text-red-300'
        }`}>
          {ROTULO_STATUS[status]}
        </span>
        <span className="ml-auto text-xs text-neutral-400">{totalParticipantes} participante(s)</span>
      </div>
      <p className="mt-1 text-xs text-neutral-400">host: {hostNome} · {dataHora}</p>

      {erro && <p role="alert" className="mt-2 text-xs text-red-400">{erro}</p>}

      {status !== 'cancelada' && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={carregando}
            onClick={cancelar}
            className="rounded border border-red-800 px-2 py-1 text-xs text-red-400 hover:bg-red-950 disabled:opacity-50"
          >
            Cancelar (adm)
          </button>
          <button
            type="button"
            onClick={() => setAberto((a) => !a)}
            className="rounded border border-neutral-700 px-2 py-1 text-xs text-neutral-300 hover:border-neutral-500"
          >
            {aberto ? 'Fechar' : 'Transferir host'}
          </button>
        </div>
      )}

      {aberto && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            value={novoHost}
            onChange={(e) => setNovoHost(e.target.value)}
            placeholder="Discord ID do novo host"
            className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-xs text-neutral-100"
          />
          <button
            type="button"
            disabled={carregando || !novoHost.trim()}
            onClick={transferir}
            className="rounded border border-cyan-800 px-2 py-1 text-xs text-cyan-300 hover:bg-cyan-950 disabled:opacity-50"
          >
            Confirmar
          </button>
        </div>
      )}
    </div>
  );
}
