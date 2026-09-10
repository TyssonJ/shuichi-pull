import Link from 'next/link';

type Props = {
  numero: string; titulo: string; descricao: string; url: string;
  sprite?: string; variante: 'pink' | 'cyan' | 'escura';
};

const ESTILOS = {
  pink: 'bg-execution-pink text-[#08090D]',
  cyan: 'bg-cyber-cyan text-[#08090D]',
  escura: 'border border-alter-green/40 bg-bg text-[#D6D6E0]',
} as const;

export function Faixa({ numero, titulo, descricao, url, sprite, variante }: Props) {
  return (
    <Link
      href={url}
      className={`clip-tab-slanted group relative flex min-h-[110px] items-center overflow-hidden border-t-2 border-[#08090D] px-4 py-4 transition-transform hover:translate-x-2 ${ESTILOS[variante]}`}
    >
      <span className="mr-3 font-mono text-[9px] tracking-[.24em] opacity-60 [writing-mode:vertical-rl] rotate-180">
        {numero}
      </span>
      <div className="relative z-10 max-w-[60%]">
        <h2 className="text-3xl font-black leading-none tracking-tight sm:text-4xl">{titulo}</h2>
        <p className="mt-1 text-[11px] leading-relaxed opacity-80">{descricao}</p>
      </div>
      {sprite && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          data-testid="sprite-faixa" aria-hidden alt=""
          src={sprite}
          className="pointer-events-none absolute -top-2 right-2 h-[190%] w-auto max-w-[40%] object-contain object-top sm:right-6"
        />
      )}
      <svg data-testid="reticula-faixa" aria-hidden viewBox="0 0 24 24"
        className="pointer-events-none absolute right-3 top-3 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-60 group-hover:animate-spin-slow">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1" />
        <line x1="12" y1="0" x2="12" y2="6" stroke="currentColor" strokeWidth="1" />
        <line x1="12" y1="18" x2="12" y2="24" stroke="currentColor" strokeWidth="1" />
        <line x1="0" y1="12" x2="6" y2="12" stroke="currentColor" strokeWidth="1" />
        <line x1="18" y1="12" x2="24" y2="12" stroke="currentColor" strokeWidth="1" />
      </svg>
    </Link>
  );
}
