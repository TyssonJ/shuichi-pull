'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { RARIDADES } from '@/lib/vocabulario';
import { CartaoItem } from './CartaoItem';
import type { Item } from '@/lib/schema-itens';

type Filtro = 'todos' | number;

const ESTILO_ABA: Record<number, { borda: string; texto: string }> = {
  0: { borda: 'border-line', texto: 'text-dim' },
  1: { borda: 'border-line', texto: 'text-dim' },
  2: { borda: 'border-line', texto: 'text-[#B9C9C6]' },
  3: { borda: 'border-cyber-cyan/60', texto: 'text-cyber-cyan' },
  4: { borda: 'border-execution-pink/60', texto: 'text-execution-pink' },
  5: { borda: 'border-amber/60', texto: 'text-amber' },
};

export function GradeEvidencias({ itens }: { itens: Item[] }) {
  const [filtro, setFiltro] = useState<Filtro>('todos');

  const abas = useMemo(() => {
    const lista = [
      { filtro: 'todos' as Filtro, rotulo: 'TODOS', nivel: -1, total: itens.length },
      ...RARIDADES.map((r) => ({
        filtro: r.nivel as Filtro,
        rotulo: r.pt.toUpperCase(),
        nivel: r.nivel,
        total: itens.filter((i) => i.nivelRaridade === r.nivel).length,
      })),
      {
        filtro: 0 as Filtro,
        rotulo: 'NÃO CLASSIFICADO',
        nivel: 0,
        total: itens.filter((i) => i.nivelRaridade === 0).length,
      },
    ];
    return lista.filter((a) => a.total > 0);
  }, [itens]);

  const filtrados = useMemo(() => {
    const base = filtro === 'todos' ? itens : itens.filter((i) => i.nivelRaridade === filtro);
    return [...base].sort((a, b) => b.nivelRaridade - a.nivelRaridade
      || a.nome.pt.localeCompare(b.nome.pt, 'pt-BR'));
  }, [itens, filtro]);

  return (
    <div>
      {/* Filtros de arquivo — abas de fichário: papel kraft escuro, clipe
          metálico no topo, corte diagonal (mesmo clip-tab-slanted do resto
          do site) pra parecer aba física de pasta, não botão de web comum. */}
      <div
        role="tablist"
        aria-label="Filtrar por raridade"
        className="mb-6 flex flex-wrap gap-1 border-b border-line pb-px"
      >
        {abas.map((a) => {
          const ativa = a.filtro === filtro;
          const cor = ESTILO_ABA[Math.max(a.nivel, 0)] ?? ESTILO_ABA[0];
          return (
            <button
              key={a.rotulo}
              type="button"
              role="tab"
              aria-selected={ativa}
              onClick={() => setFiltro(a.filtro)}
              className={`clip-tab-slanted relative border-t border-x px-3 pb-1.5 pt-3 font-mono text-[8px] tracking-[.1em] transition-colors ${
                ativa
                  ? `${cor.borda} ${cor.texto} bg-[#241C15]`
                  : 'border-line/70 text-dim bg-[#1B1610] hover:text-[#D6D6E0]'
              }`}
            >
              <span
                aria-hidden
                className="absolute left-1/2 top-1 h-1 w-3 -translate-x-1/2 rounded-full bg-[#5C5C68]"
              />
              {a.rotulo} <span className="opacity-70">[{a.total}]</span>
            </button>
          );
        })}
      </div>

      <div key={filtro} className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
        {filtrados.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: Math.min(i * 0.02, 0.4) }}
          >
            <CartaoItem item={item} />
          </motion.div>
        ))}
      </div>

      {filtrados.length === 0 && (
        <p className="py-10 text-center font-mono text-[9px] text-dim">
          Nenhum item nessa gaveta.
        </p>
      )}
    </div>
  );
}
