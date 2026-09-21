/**
 * Nota de 0 a 5 em estrelas. `valor` pode ser fracionado (média): a estrela
 * cheia é uma camada dourada recortada na proporção certa por cima das vazias.
 * Sem JavaScript, serve tanto em página de servidor quanto no cliente.
 */
export function Estrelas({
  valor, className = 'text-[13px]', rotulo,
}: { valor: number; className?: string; rotulo?: string }) {
  const limitado = Math.min(5, Math.max(0, valor));
  return (
    <span
      role="img"
      aria-label={rotulo ?? `${limitado.toString().replace('.', ',')} de 5 estrelas`}
      className={`relative inline-block whitespace-nowrap leading-none tracking-[.08em] ${className}`}
    >
      <span aria-hidden className="text-neutral-700">★★★★★</span>
      <span aria-hidden className="absolute inset-y-0 left-0 overflow-hidden text-amber" style={{ width: `${(limitado / 5) * 100}%` }}>
        ★★★★★
      </span>
    </span>
  );
}
