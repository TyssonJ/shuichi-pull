import Link from 'next/link';
import { Selo } from './Selo';
import { Icone } from './Icone';
import type { Item } from '@/lib/schema-itens';

export function CartaoItem({ item }: { item: Item }) {
  return (
    <Link
      href={`/itens/${item.id}/`}
      className="group block rounded-[4px] border border-line bg-sur p-2.5 transition-colors hover:border-teal"
    >
      <div className="mb-1.5 flex items-start gap-2">
        <Icone src={item.icone} nome={item.nome.pt} />
        <p className="flex-1 text-[12px] font-bold leading-tight text-[#D6D6E0]">
          {item.nome.pt}
        </p>
        {item.craft && (
          <span
            title="Dá para fabricar"
            className="font-mono text-[9px] text-teal"
            aria-label="Dá para fabricar"
          >
            ⚒
          </span>
        )}
      </div>
      <p className="mb-2 pl-11 font-mono text-[8px] text-dim">{item.nome.en}</p>

      <div className="flex flex-wrap items-center gap-1.5">
        <Selo raridade={item.raridade} nivel={item.nivelRaridade} />
        <span className="font-mono text-[8px] text-dim">{item.categoria.pt}</span>
        {item.peso !== null && (
          <span className="ml-auto font-mono text-[8px] text-dim">{item.peso} kg</span>
        )}
      </div>
    </Link>
  );
}
