import type { Texto } from '@/lib/schema';

/**
 * A raridade sobe de intensidade dentro da paleta do site: começa apagada e
 * termina no creme do papel, que é a coisa mais clara da tela. A palavra vem
 * sempre escrita — a cor sozinha nunca carrega a informação.
 */
const ESTILOS: Record<number, string> = {
  0: 'border-line text-dim',
  1: 'border-line text-dim',
  2: 'border-[#4E5E5C] text-[#B9C9C6]',
  3: 'border-ego-escuro text-alter-green',
  4: 'border-alter-green bg-ego-escuro text-dim',
  5: 'border-line bg-sur text-dim',
};

type Props = { raridade: Texto; nivel: number; comIngles?: boolean };

export function Selo({ raridade, nivel, comIngles = false }: Props) {
  return (
    <span
      data-nivel={nivel}
      className={`inline-flex items-baseline gap-1 rounded-[2px] border px-1.5 py-px font-mono text-[8px] uppercase tracking-[.1em] ${ESTILOS[nivel] ?? ESTILOS[0]}`}
    >
      {raridade.pt}
      {comIngles && <span className="normal-case opacity-60">{raridade.en}</span>}
    </span>
  );
}
