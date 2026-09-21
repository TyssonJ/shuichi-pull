'use client';

import { useState } from 'react';
import type { DefinicaoConfig } from '@/lib/configuracoes';
import { mensagemDeErro } from '@/lib/acao-cliente';

export function ListaToggles({
  toggles, valores, aoSalvar,
}: {
  toggles: DefinicaoConfig[];
  valores: Record<string, boolean>;
  aoSalvar: (chave: string, valor: boolean) => Promise<void>;
}) {
  const [estado, setEstado] = useState(valores);
  const [salvando, setSalvando] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function alternar(chave: string) {
    const novo = !estado[chave];
    setErro(null);
    setSalvando(chave);
    try {
      await aoSalvar(chave, novo);
      setEstado((e) => ({ ...e, [chave]: novo }));
    } catch (err) {
      setErro(mensagemDeErro(err, 'Não deu para salvar. Tenta de novo?'));
    } finally {
      setSalvando(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {erro && <p role="alert" className="text-red-400">{erro}</p>}
      {toggles.map((t) => (
        <label key={t.chave} className="flex items-start gap-3 rounded border border-neutral-800 p-3">
          <input
            type="checkbox"
            checked={estado[t.chave] ?? t.padrao}
            disabled={salvando === t.chave}
            onChange={() => alternar(t.chave)}
            className="mt-1"
          />
          <span>
            <span className="block font-bold">{t.rotulo}</span>
            <span className="block text-sm text-neutral-400">{t.descricao}</span>
          </span>
        </label>
      ))}
    </div>
  );
}
