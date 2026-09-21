'use client';

import { useEffect, useState } from 'react';
import { fusoDoAparelho, horarioNoFusoLocal, type HorarioLocal as Horario } from '@/lib/fuso-local';

/**
 * O horário da partida no relógio de quem está vendo, além do de Brasília
 * (que é o padrão do site). Não aparece pra quem já está no horário de
 * Brasília. Só calcula no navegador: o servidor não sabe o fuso de ninguém.
 */
export function HorarioLocal({ iso, className = '' }: { iso: string; className?: string }) {
  const [horario, setHorario] = useState<Horario | null>(null);

  useEffect(() => {
    function calcular() {
      const fuso = fusoDoAparelho();
      setHorario(fuso ? horarioNoFusoLocal(new Date(iso), fuso) : null);
    }
    calcular();
  }, [iso]);

  if (!horario) return null;
  return (
    <span data-testid="horario-local" className={className}>
      no seu horário: <b className="text-[#D6D6E0]">{horario.texto}</b>{' '}
      <span className="text-dim/70">({horario.gmt} · {horario.fuso})</span>
    </span>
  );
}
