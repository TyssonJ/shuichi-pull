'use client';

import { motion } from 'framer-motion';
import { calcularDistribuicao, frasePosicao } from '@/lib/distribuicao';

type Props = {
  nome: string;
  valor: number;
  unidade: string;
  valores: number[];
  passo?: number;
  maiorEhMelhor: boolean;
  sentido: string;
};

export function Regua({ nome, valor, unidade, valores, passo, maiorEhMelhor, sentido }: Props) {
  const d = calcularDistribuicao(valores, valor, passo);
  const frase = frasePosicao(d, maiorEhMelhor);
  const pico = Math.max(...d.colunas.map((c) => c.quantidade), 1);

  // Verde quando é bom estar onde está, vermelho quando não é.
  const bom = maiorEhMelhor ? d.acima <= d.abaixo : d.abaixo <= d.acima;
  const cor = bom ? 'var(--color-alter-green)' : 'var(--color-alerta)';

  const posMedia = ((d.media - d.min) / Math.max(d.max - d.min, 1)) * 100;
  const resumo =
    `${nome}: ${valor} ${unidade}. ${frase}. Média do elenco: ${Math.round(d.media)}. ` +
    `Escala de ${d.min} a ${d.max}.`;

  return (
    <div className="mb-5">
      <div className="mb-2 flex items-baseline gap-2">
        <span className="font-mono text-[10px] font-bold tracking-[.09em] text-[#D6D6E0]">{nome}</span>
        <span className="valor-grande text-[19px] font-black leading-none" style={{ color: cor }}>{valor}</span>
        <span className="font-mono text-[8px] text-dim">{unidade}</span>
        <span className="ml-auto font-mono text-[8px] text-dim">{frase}</span>
      </div>

      <div className="relative" role="img" aria-label={resumo}>
        <div className="flex h-[38px] items-end gap-[3px] overflow-x-auto" aria-hidden>
          {d.colunas.map((c, i) => (
            <motion.div
              key={c.valor}
              data-testid="coluna"
              data-ativa={c.ehOValor}
              title={`${c.valor} ${unidade}: ${c.quantidade} aluno(s)`}
              className="relative min-h-px flex-1 origin-bottom rounded-t-[1px]"
              style={{
                height: `${Math.max((c.quantidade / pico) * 100, 1)}%`,
                background: c.ehOValor ? cor : '#22222C',
                boxShadow: c.ehOValor ? `0 0 8px ${cor}` : undefined,
              }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ type: 'spring', stiffness: 120, delay: i * 0.02 }}
            >
              {c.ehOValor && (
                <span
                  className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded-[2px] px-1.5 py-px font-mono text-[7.5px] font-bold"
                  style={{ background: cor, color: '#0A0A0D' }}
                >
                  {c.valor} ← aqui
                </span>
              )}
            </motion.div>
          ))}
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute -top-1 bottom-0 w-px bg-white/25"
          style={{ left: `${posMedia}%` }}
        >
          <span className="absolute -top-3 left-1 whitespace-nowrap rounded-[2px] border border-line bg-[#0A0A0D] px-1 font-mono text-[7px] text-white/60">
            média {Math.round(d.media)}
          </span>
        </div>
      </div>

      <div className="mt-1 flex items-center justify-between border-t border-line pt-1 font-mono text-[7.5px] text-dim">
        <span className="ponta-min">{d.min}</span>
        <span className="text-[#4E4E5C]">{sentido} →</span>
        <span className="ponta-max">{d.max}</span>
      </div>
    </div>
  );
}
