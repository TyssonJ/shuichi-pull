import Link from 'next/link';
import type { Personagem } from '@/lib/schema';

export function CartaoPersonagem({ personagem: p }: { personagem: Personagem }) {
  return (
    <Link
      href={`/elenco/${p.id}/`}
      className="group relative block overflow-hidden rounded-[4px] border border-line bg-sur transition-colors hover:border-alter-green"
    >
      <div className="relative flex h-36 items-end justify-center overflow-hidden bg-bg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.sprite} alt="" className="h-full object-contain object-bottom" />
      </div>
      <div className="p-2">
        <p className="text-[12px] font-bold leading-tight text-[#D6D6E0]">{p.nome}</p>
        <p className="text-[10px] text-alter-green">{p.talento.pt}</p>
        <p className="font-mono text-[8px] text-dim">{p.talento.en}</p>
      </div>
      {!p.traducaoRevisada && (
        <span
          title="Tradução não revisada por um ADM"
          className="absolute right-1.5 top-1.5 rounded-[2px] border border-dim px-1 font-mono text-[7px] text-dim"
        >
          ?
        </span>
      )}
    </Link>
  );
}
