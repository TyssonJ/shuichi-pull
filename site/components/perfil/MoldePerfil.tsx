import type { CSSProperties, ReactNode } from 'react';
import type { EstiloPerfil } from '@/lib/estilo-perfil';
import { FundoLateral } from './FundoLateral';

/** Aplica o estilo aprovado do perfil: a cor de tema substitui o verde de
 * destaque só aqui dentro e o fundo aparece só nas laterais. Sem estilo, é
 * transparente — a página fica exatamente como sempre foi. */
export function MoldePerfil({ estilo, children }: { estilo: EstiloPerfil | null; children: ReactNode }) {
  if (!estilo) return <>{children}</>;
  const tema = estilo.corTema ? ({ '--color-alter-green': estilo.corTema } as CSSProperties) : undefined;
  return (
    <div data-testid="molde-perfil" style={tema} className="relative">
      <FundoLateral estilo={estilo} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
