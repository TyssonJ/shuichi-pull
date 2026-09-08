'use client';

import { useState } from 'react';

type Adm = { discordId: string; nome: string; papel: 'adm' | 'chefe'; promovidoPor: string | null; criadoEm: Date };

export function ListaAdms({
  adms, aoPromover, aoRebaixar,
}: {
  adms: Adm[];
  aoPromover: (args: { discordId: string; nome: string; papel: 'adm' | 'chefe' }) => Promise<void>;
  aoRebaixar: (discordId: string) => void;
}) {
  const [discordId, setDiscordId] = useState('');
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  async function adicionar() {
    setErro(null);
    try {
      await aoPromover({ discordId, nome, papel: 'adm' });
      setDiscordId('');
      setNome('');
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não deu para adicionar. Tenta de novo?');
    }
  }

  return (
    <div>
      <ul className="mb-4 flex flex-col gap-2">
        {adms.map((a) => (
          <li key={a.discordId} className="flex items-center justify-between">
            <span><span>{a.nome}</span> — {a.papel}</span>
            <button type="button" onClick={() => aoRebaixar(a.discordId)}>Rebaixar</button>
          </li>
        ))}
      </ul>
      {erro && <p role="alert" className="mb-2 text-red-400">{erro}</p>}
      <div className="flex gap-2">
        <label>Discord ID
          <input value={discordId} onChange={(e) => setDiscordId(e.target.value)} />
        </label>
        <label>Nome
          <input value={nome} onChange={(e) => setNome(e.target.value)} />
        </label>
        <button type="button" onClick={adicionar}>
          Adicionar
        </button>
      </div>
    </div>
  );
}
