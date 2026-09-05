'use client';

import { faceDoEstado, falaDoEstado, type EstadoEgo } from '@/lib/alter-ego';

type Props = {
  estado: EstadoEgo;
  variaveis?: Record<string, string | number>;
  compacta?: boolean;
  onFechar?: () => void;
};

export function JanelaEgo({ estado, variaveis, compacta = false, onFechar }: Props) {
  const face = faceDoEstado(estado);
  const fala = falaDoEstado(estado, variaveis);

  return (
    <div className="overflow-hidden rounded-[3px] border border-[#3d5732] bg-[#0d100c]">
      <div className="flex items-center gap-1.5 bg-gradient-to-b from-[#3f5c33] to-[#294020] px-1.5 py-0.5 font-mono text-[8px] tracking-[.09em] text-[#dff5cf]">
        <span>ALTER_EGO</span>
        {onFechar && (
          <button
            type="button"
            aria-label="Fechar a janela do Alter Ego"
            onClick={onFechar}
            className="ml-auto opacity-80 hover:opacity-100"
          >
            ▭ ✕
          </button>
        )}
      </div>

      {face.tipo === 'sprite' ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={face.src} alt="Alter Ego" className="block w-full" />
      ) : (
        <div
          className="relative flex items-center justify-center overflow-hidden border-[3px] border-[#E9F7DF] bg-gradient-to-b from-ego-claro to-ego-escuro"
          style={{ aspectRatio: '679 / 392' }}
        >
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage:
                'repeating-linear-gradient(#00000000 0 2px, #0000004d 2px 4px)',
            }}
          />
          <b className="relative z-10 font-normal text-[#F2FFE8] [text-shadow:0_0_9px_#b6ff7e]"
             style={{ fontSize: 'clamp(14px, 4.5cqw, 30px)' }}>
            {face.texto}
          </b>
        </div>
      )}

      {!compacta && (
        <p className="bg-[#101609] px-1.5 py-1 text-[9px] leading-snug text-[#a9c898]">
          {fala}
        </p>
      )}
    </div>
  );
}
