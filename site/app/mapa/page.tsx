import Link from 'next/link';
import { listarLocais } from '@/lib/itens';

export const metadata = { title: 'Mapa — Shuichi Pull' };

export default function PaginaMapa() {
  const locais = listarLocais();
  const comLoot = locais.filter((l) => l.conteineres.length > 0);
  const semLoot = locais.filter((l) => l.conteineres.length === 0);

  // Agrupa por andar; quem não tem andar conhecido fica num grupo próprio.
  const porAndar = new Map<string, typeof locais>();
  for (const l of comLoot) {
    const chave = l.andar?.pt ?? 'Andar não identificado';
    porAndar.set(chave, [...(porAndar.get(chave) ?? []), l]);
  }

  return (
    <div className="px-4 py-8">
      <p className="font-mono text-[8px] tracking-[.2em] text-dim">ARQUIVO 03</p>
      <h1 className="mb-1 text-4xl font-black tracking-tight text-[#F2F2F5]">MAPA</h1>
      <p className="mb-8 text-[11px] text-dim">
        {locais.length} locais da academia. {comLoot.length} têm loot mapeado.
      </p>

      {[...porAndar.entries()].map(([andar, lista]) => (
        <section key={andar} className="mb-10">
          <h2 className="mb-3 flex items-center gap-2 font-serif text-[13px] tracking-[.16em] text-[#B9B9C6]">
            <span className="h-px flex-1 bg-line" />
            {andar}
            <span className="h-px flex-1 bg-line" />
          </h2>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {lista.map((l) => (
              <Link
                key={l.id}
                href={`/mapa/${l.id}/`}
                className="block rounded-[4px] border border-line bg-sur p-3 transition-colors hover:border-teal"
              >
                <p className="text-[12px] font-bold leading-tight text-[#D6D6E0]">{l.nome.pt}</p>
                <p className="font-mono text-[8px] text-dim">{l.nome.en}</p>
                <p className="mt-2 font-mono text-[8px] text-teal">
                  {l.conteineres.length} contêineres · {l.totalItens} itens
                </p>
              </Link>
            ))}
          </div>
        </section>
      ))}

      {semLoot.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-3 flex items-center gap-2 font-serif text-[13px] tracking-[.16em] text-[#B9B9C6]">
            <span className="h-px flex-1 bg-line" />
            Sem loot mapeado
            <span className="h-px flex-1 bg-line" />
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
                  className="rounded-[2px] border border-line px-1.5 py-0.5 text-[10px] text-dim hover:border-teal hover:text-teal"
                >
                  {l.nome.pt}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
