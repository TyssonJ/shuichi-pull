type Props = { src: string | null; nome: string; className?: string };

/**
 * Item sem arte no guidebook (as entradas internas do jogo) vira uma marca
 * com a inicial, para a grade nao ficar com buraco.
 */
export function Icone({ src, nome, className = 'h-9 w-9' }: Props) {
  if (!src) {
    return (
      <span
        aria-hidden
        className={`flex shrink-0 items-center justify-center rounded-[3px] border border-line bg-[#14141A] font-mono text-[11px] text-dim ${className}`}
      >
        {nome.charAt(0).toUpperCase()}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={nome}
      className={`shrink-0 object-contain ${className}`}
      loading="lazy"
    />
  );
}
