import { notFound } from 'next/navigation';
import Link from 'next/link';
import { listarLocais, iconeDoItem } from '@/lib/itens';
import { buscarLocalComCorrecoes } from '@/lib/itens-corrigidos';
import { Icone } from '@/components/itens/Icone';
import { PainelComTrilhas } from '@/components/layout/PainelComTrilhas';

export function generateStaticParams() {
  return listarLocais().map((l) => ({ id: l.id }));
}

export default async function FichaLocal({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const local = await buscarLocalComCorrecoes(id);
  if (!local) notFound();

  return (
    <PainelComTrilhas as="article">
      <header className="relative overflow-hidden">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-3 -top-2 select-none text-5xl font-black leading-none tracking-tighter text-white/5 sm:text-7xl"
        >
          {local.andar?.pt ?? 'MAPA'}
        </span>
        <p className="relative font-mono text-[8px] tracking-[.2em] text-dim">
          {local.andar ? local.andar.pt : 'Andar não identificado'}
        </p>
        <h1 className="relative text-4xl font-black tracking-tight text-[#F2F2F5]">
          {local.nome.pt}
        </h1>
        <p className="relative font-mono text-[9px] text-dim">{local.nome.en}</p>
      </header>

      <p className="mt-4 text-[11px] text-dim">
        {local.conteineres.length > 0
          ? `${local.conteineres.length} contêineres, ${local.totalItens} itens diferentes.`
          : 'Ainda não há contêiner mapeado aqui na extração de drop rates.'}
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {local.conteineres.map((c) => (
          <section key={c.fonteId} className="rounded-[4px] border border-line bg-sur p-3">
            <h2 className="mb-3 text-[12px] font-bold text-[#D6D6E0]">{c.nome.pt}</h2>
            <ul className="space-y-2">
              {[...c.itens].sort((a, b) => b.chance - a.chance).map((i, n) => (
                <li key={`${i.id}-${n}`} className="flex items-center gap-2">
                  <Icone src={iconeDoItem(i.id)} nome={i.nome.pt} className="h-7 w-7" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2 text-[11px]">
                      <Link href={`/itens/${i.id}/`} className="truncate text-alter-green hover:underline">
                        {i.nome.pt}
                      </Link>
                      <span className="ml-auto shrink-0 font-mono text-[9px] text-dim">
                        {i.qtdMin === i.qtdMax ? `${i.qtdMin} un.` : `${i.qtdMin}–${i.qtdMax} un.`}
                      </span>
                      <span className="w-9 shrink-0 text-right font-mono text-[10px] font-bold text-[#D6D6E0]">
                        {i.chance}%
                      </span>
                    </div>
                    <div
                      className="mt-1 h-1 overflow-hidden rounded-[1px] bg-[#22222C]"
                      role="img"
                      aria-label={`${i.chance}% de chance de ${i.nome.pt}`}
                    >
                      <div className="h-full bg-alter-green" style={{ width: `${i.chance}%` }} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </PainelComTrilhas>
  );
}
