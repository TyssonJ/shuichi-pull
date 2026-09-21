import { TituloDigitado } from './TituloDigitado';

/**
 * Chassi de janela de SO retrô, verde fósforo — o ambiente inteiro da aba de
 * Mecânicas finge ser a tela do próprio Alter Ego. Os botões da barra de
 * título são decorativos (não há "minimizar" de verdade numa página web),
 * mesma lógica das marcas de mira decorativas na ficha do personagem.
 */
export function JanelaTerminal({
  children, titulo = '[ ALTER_EGO_OS v2.4 // SYSTEM_CONTROLS.EXE ]',
}: { children: React.ReactNode; titulo?: string }) {
  return (
    <div className="relative overflow-hidden rounded-[6px] border-2 border-[#0F5A2E] bg-[#041208] shadow-[0_0_40px_rgba(0,255,102,0.08)]">
      <div
        aria-hidden
        className="crt-lines animate-crt-flicker pointer-events-none absolute inset-0 z-10 opacity-40"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10"
        style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)' }}
      />

      <div className="relative z-20 flex items-center gap-2 border-b border-[#0F5A2E] bg-[#062710] px-3 py-1.5">
        <span aria-hidden className="h-2.5 w-2.5 bg-alter-green" style={{ boxShadow: '0 0 6px #00FF66' }} />
        <span aria-hidden className="h-2.5 w-2.5 bg-[#F5D30E]" />
        <span aria-hidden className="h-2.5 w-2.5 bg-execution-pink" />
        <p className="ml-2 truncate font-mono text-[9px] tracking-[.1em] text-alter-green">
          <TituloDigitado texto={titulo} />
        </p>
      </div>

      <div className="relative z-20 p-4 sm:p-6">{children}</div>
    </div>
  );
}
