'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { BotaoMini, estiloInput } from './campos-form';

export type LinhaCrud = {
  id: string;
  nome: string;
  imagem: string | null;
  /** Criado pelo painel (dá pra editar e apagar de vez) — senão é do guia. */
  extra: boolean;
  detalhe?: string;
};

const LIMITE_SEM_BUSCA = 60;

/**
 * Lista + criar + editar + remover, igual pra itens e personagens. O que muda
 * (o formulário) entra por `formulario`, que só existe dentro do cliente —
 * por isso ele é uma função e não vem direto da página de servidor.
 */
export function GerenciadorCrud({
  singular, plural, linhas, removidos, formulario, aoExcluir, aoRestaurar,
}: {
  singular: string;
  plural: string;
  linhas: LinhaCrud[];
  removidos: { id: string; nome: string }[];
  formulario: (args: { editandoId: string | null; aoConcluir: () => void }) => ReactNode;
  aoExcluir: (id: string, nome: string) => Promise<void>;
  aoRestaurar: (id: string) => Promise<void>;
}) {
  const [painel, setPainel] = useState<{ editandoId: string | null } | null>(null);
  const [busca, setBusca] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  const visiveis = useMemo(() => {
    const t = busca.trim().toLowerCase();
    if (!t) return linhas.slice(0, LIMITE_SEM_BUSCA);
    return linhas.filter((l) => l.nome.toLowerCase().includes(t) || l.id.includes(t));
  }, [linhas, busca]);

  async function remover(l: LinhaCrud) {
    const aviso = l.extra
      ? `Apagar DE VEZ ${singular} "${l.nome}"? Foi criado pelo painel e não dá pra desfazer.`
      : `Tirar "${l.nome}" do site? Ele vem do guia, então fica só oculto — dá pra restaurar depois.`;
    if (!confirm(aviso)) return;
    setErro(null);
    try {
      await aoExcluir(l.id, l.nome);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não deu para remover. Tenta de novo?');
    }
  }

  async function restaurar(id: string) {
    setErro(null);
    try {
      await aoRestaurar(id);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não deu para restaurar. Tenta de novo?');
    }
  }

  return (
    <div className="mb-8 rounded-[4px] border border-neutral-800 bg-neutral-900/60 p-4">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <h2 className="font-bold">
          {plural.charAt(0).toUpperCase() + plural.slice(1)} <span className="text-neutral-500">({linhas.length})</span>
        </h2>
        <input
          className={`${estiloInput} max-w-xs`} placeholder={`Buscar ${singular}…`} value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setPainel(painel ? null : { editandoId: null })}
          className="ml-auto rounded-[3px] border-2 border-alter-green px-3 py-1.5 font-mono text-xs font-bold tracking-[.1em] text-alter-green hover:bg-alter-green hover:text-neutral-950"
        >
          {painel ? 'Fechar' : `+ NOVO ${singular.toUpperCase()}`}
        </button>
      </div>

      {erro && <p role="alert" className="mb-3 text-sm text-red-400">{erro}</p>}

      {painel && (
        <div className="mb-5 rounded-[4px] border border-alter-green/40 bg-neutral-950 p-3">
          <h3 className="mb-3 font-mono text-xs uppercase tracking-[.12em] text-alter-green">
            {painel.editandoId ? `Editando ${singular}` : `Criar ${singular} novo`}
          </h3>
          {formulario({ editandoId: painel.editandoId, aoConcluir: () => setPainel(null) })}
        </div>
      )}

      <ul className="divide-y divide-neutral-800">
        {visiveis.map((l) => (
          <li key={l.id} className="flex items-center gap-2 py-1.5 text-sm">
            {l.imagem ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={l.imagem} alt="" className="h-7 w-7 shrink-0 object-contain" />
            ) : (
              <span className="h-7 w-7 shrink-0" />
            )}
            <span className="min-w-0 flex-1 truncate">
              {l.nome}
              {l.detalhe && <span className="ml-2 text-xs text-neutral-500">{l.detalhe}</span>}
            </span>
            <span className={`rounded-[2px] border px-1.5 py-px font-mono text-[9px] ${
              l.extra ? 'border-alter-green text-alter-green' : 'border-neutral-700 text-neutral-500'
            }`}>
              {l.extra ? 'NOVO' : 'GUIA'}
            </span>
            {l.extra && (
              <BotaoMini aoClicar={() => setPainel({ editandoId: l.id })}>Editar</BotaoMini>
            )}
            <BotaoMini perigo aoClicar={() => remover(l)}>
              {l.extra ? 'Apagar' : 'Ocultar'}
            </BotaoMini>
          </li>
        ))}
      </ul>
      {!busca.trim() && linhas.length > LIMITE_SEM_BUSCA && (
        <p className="mt-2 text-xs text-neutral-500">
          Mostrando {LIMITE_SEM_BUSCA} de {linhas.length} — use a busca pra achar os outros.
        </p>
      )}

      {removidos.length > 0 && (
        <div className="mt-4 border-t border-neutral-800 pt-3">
          <h3 className="mb-2 font-mono text-xs uppercase tracking-[.1em] text-neutral-500">
            Ocultos do guia ({removidos.length})
          </h3>
          <ul className="space-y-1">
            {removidos.map((r) => (
              <li key={r.id} className="flex items-center gap-2 text-sm text-neutral-400">
                <span className="flex-1">{r.nome}</span>
                <BotaoMini aoClicar={() => restaurar(r.id)}>Restaurar</BotaoMini>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
