'use client';

import { useState } from 'react';
import type { Personagem } from '@/lib/schema';

type Props = {
  personagensAtivos: Personagem[];
  idsRemovidos: string[];
  aoCriar: (args: {
    nome: string; jogo: string; talentoPt: string; descricaoPt: string;
    velocidade: number; mochila: number; percepcao: number; vida: number;
    sprite: string | null;
  }) => Promise<void>;
  aoExcluir: (id: string, nome: string) => Promise<void>;
  aoRestaurar: (id: string) => Promise<void>;
};

const FORM_VAZIO = {
  nome: '', jogo: '', talentoPt: '', descricaoPt: '',
  velocidade: '190', mochila: '15', percepcao: '5', vida: '100', sprite: '',
};

export function GerenciarPersonagens({
  personagensAtivos, idsRemovidos, aoCriar, aoExcluir, aoRestaurar,
}: Props) {
  const [form, setForm] = useState(FORM_VAZIO);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome.trim()) { setErro('Dá um nome pro personagem.'); return; }
    if (!form.jogo.trim()) { setErro('Dá o jogo de origem.'); return; }
    setErro(null);
    setCarregando(true);
    try {
      await aoCriar({
        nome: form.nome.trim(),
        jogo: form.jogo.trim(),
        talentoPt: form.talentoPt.trim() || 'Sem talento definido',
        descricaoPt: form.descricaoPt.trim() || 'Sem descrição ainda.',
        velocidade: Math.min(400, Math.max(100, Number(form.velocidade) || 190)),
        mochila: Math.min(200, Math.max(1, Number(form.mochila) || 15)),
        percepcao: Math.min(10, Math.max(1, Number(form.percepcao) || 5)),
        vida: Math.max(1, Number(form.vida) || 100),
        sprite: form.sprite.trim() || null,
      });
      setForm(FORM_VAZIO);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não deu para criar. Tenta de novo?');
    } finally {
      setCarregando(false);
    }
  }

  async function excluir(p: Personagem) {
    if (!confirm(`Remover "${p.nome}" do site?`)) return;
    setErro(null);
    try {
      await aoExcluir(p.id, p.nome);
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
      <h2 className="mb-3 font-bold">Adicionar personagem novo</h2>
      {erro && <p role="alert" className="mb-3 text-red-400">{erro}</p>}

      <form onSubmit={criar} className="mb-4 grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          Nome
          <input
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Jogo de origem
          <input
            value={form.jogo}
            onChange={(e) => setForm({ ...form, jogo: e.target.value })}
            className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          Talento
          <input
            value={form.talentoPt}
            onChange={(e) => setForm({ ...form, talentoPt: e.target.value })}
            className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Velocidade (100–400)
          <input
            value={form.velocidade}
            onChange={(e) => setForm({ ...form, velocidade: e.target.value })}
            inputMode="numeric"
            className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Mochila (1–200)
          <input
            value={form.mochila}
            onChange={(e) => setForm({ ...form, mochila: e.target.value })}
            inputMode="numeric"
            className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Percepção (1–10)
          <input
            value={form.percepcao}
            onChange={(e) => setForm({ ...form, percepcao: e.target.value })}
            inputMode="numeric"
            className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Vida
          <input
            value={form.vida}
            onChange={(e) => setForm({ ...form, vida: e.target.value })}
            inputMode="numeric"
            className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          URL do sprite (opcional — sem imagem, usa a silhueta padrão)
          <input
            value={form.sprite}
            onChange={(e) => setForm({ ...form, sprite: e.target.value })}
            placeholder="https://…"
            className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1"
          />
          {form.sprite.trim() && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.sprite} alt="" className="mt-1 h-16 w-16 rounded border border-neutral-700 object-contain" />
          )}
        </label>
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          Descrição
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
          {carregando ? 'Criando…' : 'Criar personagem'}
        </button>
      </form>

      <ul className="space-y-1">
        {personagensAtivos.map((p) => (
          <li key={p.id} className="flex items-center gap-2 text-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.sprite} alt="" className="h-8 w-8 object-contain" />
            <span className="flex-1">{p.nome}</span>
            <button
              type="button"
              onClick={() => excluir(p)}
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
