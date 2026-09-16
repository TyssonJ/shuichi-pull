'use client';

import { useState } from 'react';
import { RARIDADES } from '@/lib/vocabulario';
import type { Item } from '@/lib/schema-itens';

type Props = {
  itensAtivos: Item[];
  idsRemovidos: string[];
  aoCriar: (args: {
    nomePt: string; categoriaPt: string; raridadePt: string; nivelRaridade: number;
    peso: number | null; icone: string | null; descricaoPt: string | null;
  }) => Promise<void>;
  aoExcluir: (id: string, nome: string) => Promise<void>;
  aoRestaurar: (id: string) => Promise<void>;
};

const FORM_VAZIO = {
  nomePt: '', categoriaPt: '', raridadePt: RARIDADES[0].pt, peso: '', icone: '', descricaoPt: '',
};

export function GerenciarItens({ itensAtivos, idsRemovidos, aoCriar, aoExcluir, aoRestaurar }: Props) {
  const [form, setForm] = useState(FORM_VAZIO);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nomePt.trim()) { setErro('Dá um nome pro item.'); return; }
    setErro(null);
    setCarregando(true);
    try {
      const nivel = RARIDADES.find((r) => r.pt === form.raridadePt)?.nivel ?? 1;
      await aoCriar({
        nomePt: form.nomePt.trim(),
        categoriaPt: form.categoriaPt.trim() || 'Diversos',
        raridadePt: form.raridadePt,
        nivelRaridade: nivel,
        peso: form.peso.trim() ? Number(form.peso) : null,
        icone: form.icone.trim() || null,
        descricaoPt: form.descricaoPt.trim() || null,
      });
      setForm(FORM_VAZIO);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não deu para criar. Tenta de novo?');
    } finally {
      setCarregando(false);
    }
  }

  async function excluir(item: Item) {
    if (!confirm(`Remover "${item.nome.pt}" do site?`)) return;
    setErro(null);
    try {
      await aoExcluir(item.id, item.nome.pt);
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
    <div className="mb-8 rounded-md border border-neutral-800 bg-neutral-900 p-4">
      <h2 className="mb-3 font-bold">Adicionar item novo</h2>
      {erro && <p role="alert" className="mb-3 text-red-400">{erro}</p>}

      <form onSubmit={criar} className="mb-4 grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          Nome
          <input
            value={form.nomePt}
            onChange={(e) => setForm({ ...form, nomePt: e.target.value })}
            className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Categoria
          <input
            value={form.categoriaPt}
            onChange={(e) => setForm({ ...form, categoriaPt: e.target.value })}
            placeholder="Diversos"
            className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Raridade
          <select
            value={form.raridadePt}
            onChange={(e) => setForm({ ...form, raridadePt: e.target.value })}
            className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1"
          >
            {RARIDADES.map((r) => <option key={r.pt} value={r.pt}>{r.pt}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Peso (kg, opcional)
          <input
            value={form.peso}
            onChange={(e) => setForm({ ...form, peso: e.target.value })}
            inputMode="decimal"
            className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          URL da imagem (opcional)
          <input
            value={form.icone}
            onChange={(e) => setForm({ ...form, icone: e.target.value })}
            placeholder="https://…"
            className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1"
          />
          {form.icone.trim() && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.icone} alt="" className="mt-1 h-12 w-12 rounded border border-neutral-700 object-contain" />
          )}
        </label>
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          Descrição (opcional)
          <textarea
            value={form.descricaoPt}
            onChange={(e) => setForm({ ...form, descricaoPt: e.target.value })}
            rows={2}
            className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1"
          />
        </label>
        <button
          type="submit"
          disabled={carregando}
          className="rounded bg-neutral-100 px-3 py-1.5 text-sm font-bold text-neutral-950 sm:col-span-2 sm:w-fit"
        >
          {carregando ? 'Criando…' : 'Criar item'}
        </button>
      </form>

      <ul className="space-y-1">
        {itensAtivos.map((item) => (
          <li key={item.id} className="flex items-center gap-2 text-sm">
            {item.icone && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.icone} alt="" className="h-6 w-6 object-contain" />
            )}
            <span className="flex-1">{item.nome.pt}</span>
            <button
              type="button"
              onClick={() => excluir(item)}
              className="rounded border border-red-800 px-2 py-0.5 text-red-400 hover:bg-red-950"
            >
              Remover
            </button>
          </li>
        ))}
      </ul>

      {idsRemovidos.length > 0 && (
        <div className="mt-4 border-t border-neutral-800 pt-3">
          <h3 className="mb-2 text-sm font-bold text-dim">Removidos</h3>
          <ul className="space-y-1">
            {idsRemovidos.map((id) => (
              <li key={id} className="flex items-center gap-2 text-sm text-dim">
                <span className="flex-1">{id}</span>
                <button
                  type="button"
                  onClick={() => restaurar(id)}
                  className="rounded border border-neutral-700 px-2 py-0.5 hover:bg-neutral-800"
                >
                  Restaurar
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
