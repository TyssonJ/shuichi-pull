import Link from 'next/link';

export function CartaoStatus({
  valor, rotulo, url, cor = 'text-neutral-100',
}: {
  valor: number | string;
  rotulo: string;
  url: string;
  cor?: string;
}) {
  return (
    <Link
      href={url}
      className="flex flex-col gap-1 rounded border border-neutral-800 bg-neutral-900 p-4 transition-colors hover:border-neutral-600"
    >
      <span className={`text-3xl font-black ${cor}`}>{valor}</span>
      <span className="text-xs uppercase tracking-wide text-neutral-400">{rotulo}</span>
    </Link>
  );
}
