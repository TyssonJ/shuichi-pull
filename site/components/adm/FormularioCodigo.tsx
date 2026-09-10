'use client';

import { useState } from 'react';
import type { Codigo } from '@/lib/eventos';

const VAZIO: Codigo = { codigo: '', recompensa: '', descricao: '', expiraEm: null, fonte: null };

export function FormularioCodigo({
  codigo, aoSalvar,
}: { codigo: Codigo | null; aoSalvar: (dados: Codigo) => Promise<void> }) {
  const [dados, setDados] = useState<Codigo>(codigo ?? VAZIO);
  const [erro, setErro] = useState<string | null>(null);

  function campo<K extends keyof Codigo>(chave: K, valor: Codigo[K]) {
    setDados((d) => ({ ...d, [chave]: valor }));
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    try {
      await aoSalvar(dados);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não deu para salvar. Tenta de novo?');
    }
  }

  return (
    <form className="flex flex-col gap-2" onSubmit={enviar}>
      <label>Código
        <input value={dados.codigo} onChange={(e) => campo('codigo', e.target.value)} disabled={!!codigo} />
      </label>
      <label>Recompensa
        <input value={dados.recompensa} onChange={(e) => campo('recompensa', e.target.value)} />
      </label>
      <label>Descrição
        <textarea value={dados.descricao} onChange={(e) => campo('descricao', e.target.value)} />
      </label>
      <label>Expira em (opcional)
        <input type="date" value={dados.expiraEm ?? ''} onChange={(e) => campo('expiraEm', e.target.value || null)} />
      </label>
      <label>Fonte (opcional, URL)
        <input value={dados.fonte ?? ''} onChange={(e) => campo('fonte', e.target.value || null)} />
      </label>
      <button type="submit">Salvar</button>
      {erro && <p role="alert" className="text-red-400">{erro}</p>}
    </form>
  );
}
