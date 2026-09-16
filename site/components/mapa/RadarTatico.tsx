/**
 * Puramente decorativo — não mapeia posição real de nenhum local (não temos
 * esse dado). É a textura de "radar tático" pedida pro visual da aba, não
 * uma planta baixa interativa de verdade.
 */
export function RadarTatico({ total }: { total: number }) {
  const blips = Array.from({ length: Math.min(total, 10) }, (_, i) => {
    const angulo = (i / Math.min(total, 10)) * 360 + (i % 3) * 17;
    const raio = 28 + ((i * 13) % 42);
    return { angulo, raio };
  });

  return (
    <div
      aria-hidden
      className="relative mx-auto h-40 w-40 shrink-0 overflow-hidden rounded-full border border-cyber-cyan/40 bg-[#050B14] sm:h-48 sm:w-48"
      style={{ boxShadow: '0 0 30px rgba(0,240,255,0.12), inset 0 0 30px rgba(0,240,255,0.08)' }}
    >
      <div className="bg-blueprint-grid absolute inset-0 opacity-60" />
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className="absolute rounded-full border border-cyber-cyan/20"
          style={{
            inset: `${n * 16}%`,
          }}
        />
      ))}

      <div
        className="animate-spin-slow absolute inset-0"
        style={{
          background: 'conic-gradient(from 0deg, rgba(0,240,255,0.4), transparent 22%, transparent 100%)',
        }}
      />

      {blips.map((b, i) => (
        <span
          key={i}
          className="absolute h-1.5 w-1.5 animate-pulse rounded-full bg-cyber-cyan"
          style={{
            top: `${50 + b.raio * Math.sin((b.angulo * Math.PI) / 180) * 0.42}%`,
            left: `${50 + b.raio * Math.cos((b.angulo * Math.PI) / 180) * 0.42}%`,
            boxShadow: '0 0 6px #00F0FF',
            animationDelay: `${(i % 5) * 0.3}s`,
          }}
        />
      ))}

      <div className="absolute inset-0 flex items-center justify-center">
        <span className="h-1 w-1 rounded-full bg-cyber-cyan" style={{ boxShadow: '0 0 8px #00F0FF' }} />
      </div>
    </div>
  );
}
