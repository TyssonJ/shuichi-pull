import type { EstiloPerfil } from '@/lib/estilo-perfil';

/**
 * Fundo só nas laterais, com fade em direção ao miolo — como no perfil da Steam.
 * `fixo` cobre a janela toda (página do perfil); `previa` fica dentro de uma
 * caixa (editor e fila de aprovação). A direita, se não tiver imagem própria,
 * espelha a esquerda.
 */
export function FundoLateral({
  estilo, modo = 'fixo', className = '',
}: { estilo: Pick<EstiloPerfil, 'fundoEsquerdo' | 'fundoDireito'>; modo?: 'fixo' | 'previa'; className?: string }) {
  if (!estilo.fundoEsquerdo) return null;
  const direita = estilo.fundoDireito ?? estilo.fundoEsquerdo;
  const espelhar = !estilo.fundoDireito;
  const fixo = modo === 'fixo';

  // No perfil, as faixas ocupam só o que sobra ao lado da coluna de conteúdo
  // (56rem) — em telas estreitas somem, o texto nunca fica sobre a imagem.
  const larguraFixa = { width: 'max(0px, calc(50vw - 26rem))' };
  const base = `pointer-events-none ${fixo ? 'fixed inset-y-0 hidden md:block' : 'absolute inset-y-0 w-[38%]'}`;

  return (
    <div aria-hidden data-testid="fundo-lateral" className={className}>
      <div
        data-lado="esquerdo"
        className={`${base} left-0 z-0 [mask-image:linear-gradient(to_right,black_45%,transparent)] [-webkit-mask-image:linear-gradient(to_right,black_45%,transparent)]`}
        style={fixo ? larguraFixa : undefined}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" src={estilo.fundoEsquerdo} referrerPolicy="no-referrer" className="h-full w-full object-cover opacity-80" />
      </div>
      <div
        data-lado="direito"
        className={`${base} right-0 z-0 [mask-image:linear-gradient(to_left,black_45%,transparent)] [-webkit-mask-image:linear-gradient(to_left,black_45%,transparent)]`}
        style={fixo ? larguraFixa : undefined}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt="" src={direita} referrerPolicy="no-referrer"
          className={`h-full w-full object-cover opacity-80 ${espelhar ? '-scale-x-100' : ''}`}
        />
      </div>
    </div>
  );
}
