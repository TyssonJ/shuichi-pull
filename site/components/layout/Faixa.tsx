import Link from 'next/link';

type Props = {
  numero: string; titulo: string; descricao: string; url: string;
  sprite?: string; variante: 'teal' | 'papel' | 'escura';
};

const ESTILOS = {
  teal: 'bg-teal-escuro text-papel',
  papel: 'bg-papel text-tinta',
  escura: 'bg-bg text-papel',
} as const;

export function Faixa({ numero, titulo, descricao, url, sprite, variante }: Props) {
  return (
    <Link
      href={url}
      className={`relative flex min-h-[110px] items-center overflow-hidden border-t-2 border-tinta px-4 py-4 ${ESTILOS[variante]}`}
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
          className="absolute -bottom-3 right-0 h-[150%] object-contain"
        />
      )}
    </Link>
  );
}
