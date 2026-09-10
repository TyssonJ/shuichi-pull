import type { Personagem } from '@/lib/schema';

/**
 * Preenche o "deserto escuro" das laterais em telas bem largas (2xl+) com
 * uma coluna de telemetria falsa do Alter Ego — dados reais do personagem
 * (id, atributos) formatados como log de sistema, pra parecer um terminal
 * vivo monitorando o arquivo em vez de decoração genérica.
 *
 * Some em telas menores: article já tem max-w-[1400px], então só sobra
 * espaço lateral de verdade acima disso.
 */

function hexDoId(id: string): string {
  let seed = 0;
  for (let i = 0; i < id.length; i++) seed = (seed * 31 + id.charCodeAt(i)) >>> 0;
  return seed.toString(16).padStart(8, '0').toUpperCase();
}

// Barras de "atividade de sinal" — alturas determinísticas a partir do id,
// mesmo raciocínio do código de barras da carteirinha: sem Math.random()
// pra não divergir entre servidor e cliente.
function alturasDoSinal(id: string): number[] {
  let seed = hexDoId(id).length + id.length;
  for (let i = 0; i < id.length; i++) seed = (seed * 1103515245 + 12345) % 2147483648;
  return Array.from({ length: 10 }, (_, i) => {
    seed = (seed * 1103515245 + 12345 + i) % 2147483648;
    return 20 + (Math.abs(seed) % 80);
  });
}

export function TelemetriaLateral(
  { personagem: p, lado }: { personagem: Personagem; lado: 'esquerda' | 'direita' }
) {
  const hex = hexDoId(p.id);
  const alturas = alturasDoSinal(`${p.id}-${lado}`);

  const linhas = [
    'NODE :: ALTER_EGO_OS',
    `TRACE_ID :: 0x${hex}`,
    `SIG.VEL :: ${p.velocidade} u/s`,
    `SIG.PCP :: ${p.percepcao}/10`,
    `SIG.MOC :: ${p.mochila} unid.`,
    'PKT_LOSS :: 0.0%',
    'STATUS :: MONITORANDO',
  ];

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed top-1/2 z-0 hidden w-32 -translate-y-1/2 flex-col gap-3 2xl:flex ${
        lado === 'esquerda' ? 'left-6 items-start' : 'right-6 items-end'
      }`}
    >
      <div className={`flex items-end gap-[3px] ${lado === 'direita' ? 'flex-row-reverse' : ''}`}>
        {alturas.map((h, i) => (
          <span
            key={i}
            className="w-[3px] animate-pulse bg-alter-green/25"
            style={{ height: `${h * 0.3}px`, animationDelay: `${i * 0.15}s`, animationDuration: '2.4s' }}
          />
        ))}
      </div>

      <div className={`font-mono text-[8px] leading-relaxed text-alter-green/30 ${lado === 'direita' ? 'text-right' : ''}`}>
        {linhas.map((linha) => (
          <p key={linha} className="whitespace-nowrap">{linha}</p>
        ))}
        <p className="whitespace-nowrap text-alter-green/50">
          {lado === 'esquerda' ? '█' : ''}
          <span className="animate-pulse">_</span>
          {lado === 'direita' ? '█' : ''}
        </p>
      </div>
    </div>
  );
}
