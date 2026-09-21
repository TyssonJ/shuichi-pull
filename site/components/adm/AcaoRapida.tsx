import Link from 'next/link';

/** Botão de atalho do painel: leva direto à ação, sem passar pela lista. */
export function AcaoRapida({
  href, children, destaque = false, novaAba = false,
}: { href: string; children: React.ReactNode; destaque?: boolean; novaAba?: boolean }) {
  return (
    <Link
      href={href}
      {...(novaAba ? { target: '_blank', rel: 'noreferrer' } : {})}
      className={`border-2 px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[.14em] transition-colors ${
        destaque
          ? 'border-execution-pink bg-execution-pink/10 text-execution-pink hover:bg-execution-pink hover:text-[#08090D]'
          : 'border-alter-green/60 text-alter-green hover:bg-alter-green hover:text-[#08090D]'
      }`}
    >
      {children}
    </Link>
  );
}
