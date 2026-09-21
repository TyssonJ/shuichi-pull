import Link from 'next/link';

export function CartaoStatus({
  valor, rotulo, url, cor = '#D6D6E0', alerta = false,
}: {
  valor: number | string;
  rotulo: string;
  url: string;
  /** Cor do número (hex) — vira também o brilho. */
  cor?: string;
  /** Pede atenção: borda rosa com brilho e um ponto pulsando (ex.: UIDs esperando revisão). */
  alerta?: boolean;
}) {
  return (
    <Link
      href={url}
      className={`clip-dossier-card group relative flex flex-col gap-1 border-2 bg-[#0A0D0A] p-4 transition-colors ${
        alerta ? 'border-execution-pink shadow-[0_0_16px_rgba(255,0,127,.45)]' : 'border-neutral-800 hover:border-alter-green'
      }`}
    >
      <span aria-hidden className="crt-lines pointer-events-none absolute inset-0 opacity-15" />
      {alerta && <span aria-hidden className="absolute right-3 top-3 h-2 w-2 animate-pulse rounded-full bg-execution-pink" />}
      <span
        className="relative font-mono text-4xl font-black leading-none"
        style={{ color: cor, textShadow: `0 0 14px ${cor}66` }}
      >
        {valor}
      </span>
      <span className="relative font-mono text-[10px] uppercase tracking-[.16em] text-neutral-400 group-hover:text-neutral-200">
        {rotulo}
      </span>
    </Link>
  );
}
