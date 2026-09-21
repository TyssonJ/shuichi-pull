'use client';

import { useState } from 'react';
import { desembrulhar, mensagemDeErro, type Acao } from '@/lib/acao-cliente';

type StatusUuid = 'pendente' | 'aprovado' | 'banido';

const CORES_STATUS: Record<StatusUuid, string> = {
  pendente: 'border-amber text-amber',
  aprovado: 'border-alter-green text-alter-green',
  banido: 'border-execution-pink text-execution-pink',
};

export function CartaoUsuario({
  discordId, discordNome, discordAvatar, apelido = null, uuidGmod, uuidStatus, podeSerHost,
  aoDefinirStatus, aoDefinirPodeSerHost, aoResetarIdentidade,
}: {
  /** Apelido escolhido no site — o ADM sempre vê também o nome real do Discord. */
  apelido?: string | null;
  discordId: string;
  discordNome: string;
  discordAvatar: string | null;
  uuidGmod: string | null;
  uuidStatus: StatusUuid;
  podeSerHost: boolean;
  aoDefinirStatus: (discordId: string, status: StatusUuid) => Promise<void>;
  aoDefinirPodeSerHost: (discordId: string, valor: boolean) => Promise<void>;
  aoResetarIdentidade?: (discordId: string) => Acao;
}) {
  const [apelidoAtual, setApelidoAtual] = useState(apelido);
  const [erroIdentidade, setErroIdentidade] = useState<string | null>(null);
  const [status, setStatus] = useState(uuidStatus);
  const [host, setHost] = useState(podeSerHost);
  const [carregando, setCarregando] = useState(false);

  async function mudarStatus(novo: StatusUuid) {
    setCarregando(true);
    try {
      await aoDefinirStatus(discordId, novo);
      setStatus(novo);
    } finally {
      setCarregando(false);
    }
  }

  async function resetarIdentidade() {
    if (!aoResetarIdentidade) return;
    setErroIdentidade(null);
    setCarregando(true);
    try {
      await desembrulhar(aoResetarIdentidade(discordId));
      setApelidoAtual(null);
    } catch (e) {
      setErroIdentidade(mensagemDeErro(e, 'Não deu para resetar.'));
    } finally {
      setCarregando(false);
    }
  }

  async function alternarHost() {
    setCarregando(true);
    try {
      const novo = !host;
      await aoDefinirPodeSerHost(discordId, novo);
      setHost(novo);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="clip-dossier-card flex flex-wrap items-center gap-3 border-2 border-neutral-800 bg-[#0A0D0A] p-3">
      {discordAvatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={discordAvatar} alt="" className="h-10 w-10 rounded-full" />
      ) : (
        <div className="h-10 w-10 rounded-full bg-neutral-800" />
      )}

      <div className="min-w-0 flex-1">
        <p className="font-bold">{discordNome}</p>
        {apelidoAtual && (
          <p className="flex flex-wrap items-center gap-2 text-xs text-neutral-300">
            apelido no site: <b>{apelidoAtual}</b>
            {aoResetarIdentidade && (
              <button
                type="button"
                disabled={carregando}
                onClick={() => void resetarIdentidade()}
                className="font-mono text-[10px] text-neutral-500 underline hover:text-red-400 disabled:opacity-50"
              >
                resetar apelido e ícone
              </button>
            )}
          </p>
        )}
        {erroIdentidade && <p role="alert" className="text-xs text-red-400">{erroIdentidade}</p>}
        <p className="font-mono text-xs text-neutral-400">
          UID: {uuidGmod ?? <span className="italic text-neutral-600">não informado</span>}
        </p>
      </div>

      <div className="flex items-center gap-1">
        {(['pendente', 'aprovado', 'banido'] as StatusUuid[]).map((s) => (
          <button
            key={s}
            type="button"
            disabled={carregando}
            onClick={() => mudarStatus(s)}
            className={`border px-2 py-1 font-mono text-[10px] uppercase tracking-[.12em] disabled:opacity-50 ${
              status === s ? CORES_STATUS[s] : 'border-neutral-700 text-neutral-500 hover:border-neutral-500'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <label className="flex items-center gap-1.5 text-xs text-neutral-300">
        <input type="checkbox" checked={host} disabled={carregando} onChange={alternarHost} />
        pode ser host
      </label>
    </div>
  );
}
