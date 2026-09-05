type Props = { titulo?: string; children: React.ReactNode };

export function Papel({ titulo, children }: Props) {
  return (
    <div
      className="relative rounded-[2px] bg-papel p-4 text-tinta shadow-[0_10px_26px_rgba(0,0,0,.7)]"
      style={{ transform: 'rotate(-0.4deg)' }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(#14141a12 1px, transparent 1px)',
          backgroundSize: '4px 4px',
        }}
      />
      {titulo && (
        <h2 className="relative mb-2 flex items-center gap-2 font-serif text-[12px] tracking-[.18em]">
          <span className="h-px flex-1 bg-tinta/40" />
          {titulo}
          <span className="h-px flex-1 bg-tinta/40" />
        </h2>
      )}
      <div className="relative">{children}</div>
    </div>
  );
}
