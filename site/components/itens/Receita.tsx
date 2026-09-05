import Link from 'next/link';
import type { Craft } from '@/lib/schema-itens';

/**
 * A receita é lida como fórmula: ingredientes com a quantidade em bolinha,
 * seta, resultado destacado. Bancada e chance ficam no cabeçalho.
 */
export function Receita({ craft, resultado }: { craft: Craft; resultado: string }) {
  const descricao =
    craft.ingredientes.map((i) => `${i.qtd} ${i.nome.pt}`).join(' mais ') +
    ` resulta em ${resultado}` +
    ` na ${craft.bancadas.map((b) => b.pt).join(' ou ')}` +
    `, com ${craft.chance} de chance.`;

  return (
    <div role="group" aria-label={descricao}>
      <p className="mb-2 font-mono text-[8px] tracking-[.14em] text-dim">
        {craft.bancadas.map((b) => b.pt).join(' · ')} · CHANCE {craft.chance}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {craft.ingredientes.map((ing, i) => (
          <span key={`${ing.nome.en}-${i}`} className="flex items-center gap-2">
            {i > 0 && <span className="font-mono text-[11px] text-dim">+</span>}
            <span className="flex items-center gap-1.5 rounded-[3px] border border-line bg-sur px-2 py-1">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-teal-escuro font-mono text-[8px] font-bold text-papel">
                {ing.qtd}
              </span>
              {ing.id ? (
                <Link href={`/itens/${ing.id}/`} className="text-[11px] text-[#D6D6E0] hover:text-teal">
                  {ing.nome.pt}
                </Link>
              ) : (
                <span className="text-[11px] text-[#D6D6E0]">{ing.nome.pt}</span>
              )}
            </span>
          </span>
        ))}

        <span aria-hidden className="font-mono text-[13px] text-teal">→</span>

        <span
          data-testid="resultado"
          className="rounded-[3px] border border-teal bg-teal-escuro px-2 py-1 text-[11px] font-bold text-papel"
        >
          {resultado}
        </span>
      </div>
    </div>
  );
}
