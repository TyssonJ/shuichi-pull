import Link from 'next/link';
import { iconeDoItem } from '@/lib/itens';
import { listarLocaisComCorrecoes } from '@/lib/itens-corrigidos';
import { Icone } from '@/components/itens/Icone';
import { RadarTatico } from '@/components/mapa/RadarTatico';
import { PainelComTrilhas } from '@/components/layout/PainelComTrilhas';
import type { Local } from '@/lib/schema-itens';

/** Os itens mais provaveis do local, sem repetir quem cai em varios conteineres. */
function amostraDeLoot(local: Local, quantos = 6) {
  const melhores = new Map<string, { id: string; nome: string; chance: number }>();
  for (const c of local.conteineres) {
    for (const i of c.itens) {
      const atual = melhores.get(i.id);
      if (!atual || i.chance > atual.chance) {
        melhores.set(i.id, { id: i.id, nome: i.nome.pt, chance: i.chance });
      }
    }
  }
  return [...melhores.values()].sort((a, b) => b.chance - a.chance).slice(0, quantos);
}

export const metadata = { title: 'Mapa — Shuichi Pull' };

export default async function PaginaMapa() {
  const locais = await listarLocaisComCorrecoes();
  const comLoot = locais.filter((l) => l.conteineres.length > 0);
  const semLoot = locais.filter((l) => l.conteineres.length === 0);

  // Agrupa por andar; quem não tem andar conhecido fica num grupo próprio.
  const porAndar = new Map<string, typeof locais>();
  for (const l of comLoot) {
    const chave = l.andar?.pt ?? 'Andar não identificado';
    porAndar.set(chave, [...(porAndar.get(chave) ?? []), l]);
  }

  return (
    <PainelComTrilhas>
      <div className="mb-8 flex flex-col-reverse items-center gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[8px] tracking-[.2em] text-dim">ARQUIVO 03</p>
          <h1 className="mb-1 text-4xl font-black tracking-tight text-[#F2F2F5]">MAPA</h1>
          <p className="text-[11px] text-dim">
            {locais.length} locais da academia. {comLoot.length} têm loot mapeado.
          </p>
        </div>
        <RadarTatico total={locais.length} />
      </div>

      {[...porAndar.entries()].map(([andar, lista]) => (
        <section key={andar} className="mb-10">
          <h2 className="mb-3 flex items-center gap-2 font-serif text-[13px] tracking-[.16em] text-[#8FE0F0]">
            <span className="h-px flex-1 bg-cyber-cyan/25" />
            {andar}
            <span className="h-px flex-1 bg-cyber-cyan/25" />
          </h2>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {lista.map((l) => (
              <Link
                key={l.id}
                href={`/mapa/${l.id}/`}
                className="bg-blueprint-grid group relative block overflow-hidden rounded-[4px] border border-cyber-cyan/25 bg-[#050B14] p-3 transition-colors hover:border-cyber-cyan"
              >
                <span
                  aria-hidden
                  className="absolute right-2 top-2 h-1.5 w-1.5 animate-pulse rounded-full bg-cyber-cyan"
                  style={{ boxShadow: '0 0 6px #00F0FF' }}
                />
                <span
                  aria-hidden
                  className="crt-lines pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center gap-1 bg-[#050B14]/92 px-2 text-center opacity-0 shadow-[inset_0_0_20px_rgba(0,240,255,0.25)] transition-opacity duration-150 group-hover:opacity-100"
                >
                  <span className="font-mono text-[9px] tracking-[.08em] text-cyber-cyan">{l.nome.pt}</span>
                  <span className="font-mono text-[8px] text-[#8FE0F0]">
                    {l.conteineres.length} contêineres · {l.totalItens} itens
                  </span>
                </span>
                <p className="text-[12px] font-bold leading-tight text-[#D6D6E0]">{l.nome.pt}</p>
                <p className="font-mono text-[8px] text-dim">{l.nome.en}</p>
                <ul className="mt-2 flex flex-wrap gap-1">
                  {amostraDeLoot(l).map((i) => (
                    <li key={i.id} title={`${i.nome} — ${i.chance}%`}>
                      <Icone src={iconeDoItem(i.id)} nome={i.nome} className="h-6 w-6" />
                    </li>
                  ))}
                </ul>
                <p className="mt-2 font-mono text-[8px] text-cyber-cyan">
                  {l.conteineres.length} contêineres · {l.totalItens} itens
                </p>
              </Link>
            ))}
          </div>
        </section>
      ))}

      {semLoot.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-3 flex items-center gap-2 font-serif text-[13px] tracking-[.16em] text-[#8FE0F0]">
            <span className="h-px flex-1 bg-cyber-cyan/25" />
            Sem loot mapeado
            <span className="h-px flex-1 bg-cyber-cyan/25" />
          </h2>
          <p className="mb-3 text-[11px] text-dim">
            Estes locais existem na academia, mas ainda não têm contêiner
            registrado na extração de drop rates.
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {semLoot.map((l) => (
              <li key={l.id}>
                <Link
                  href={`/mapa/${l.id}/`}
                  className="rounded-[2px] border border-cyber-cyan/25 px-1.5 py-0.5 text-[10px] text-dim hover:border-cyber-cyan hover:text-cyber-cyan"
                >
                  {l.nome.pt}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </PainelComTrilhas>
  );
}
