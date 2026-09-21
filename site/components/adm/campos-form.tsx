import type { ReactNode } from 'react';

export const estiloInput =
  'w-full rounded-[3px] border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-alter-green focus:outline-none';

export function Campo({
  rotulo, dica, className = '', children,
}: { rotulo: string; dica?: string; className?: string; children: ReactNode }) {
  return (
    <label className={`flex flex-col gap-1 text-xs ${className}`}>
      <span className="font-mono uppercase tracking-[.08em] text-neutral-400">{rotulo}</span>
      {children}
      {dica && <span className="text-[11px] text-neutral-500">{dica}</span>}
    </label>
  );
}

/** Bloco nomeado do formulário — o formulário completo é grande demais pra
 * ser uma pilha única de campos. */
export function Secao({ titulo, descricao, children }: { titulo: string; descricao?: string; children: ReactNode }) {
  return (
    <fieldset className="rounded-[4px] border border-neutral-800 p-3">
      <legend className="px-1 font-mono text-[11px] font-bold uppercase tracking-[.12em] text-alter-green">
        {titulo}
      </legend>
      {descricao && <p className="mb-3 text-xs text-neutral-500">{descricao}</p>}
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

export function BotaoMini({
  children, aoClicar, perigo = false, desabilitado = false,
}: { children: ReactNode; aoClicar: () => void; perigo?: boolean; desabilitado?: boolean }) {
  return (
    <button
      type="button"
      onClick={aoClicar}
      disabled={desabilitado}
      className={`rounded-[3px] border px-2 py-1 text-xs disabled:opacity-50 ${
        perigo
          ? 'border-red-800 text-red-400 hover:bg-red-950'
          : 'border-neutral-700 text-neutral-300 hover:border-neutral-500'
      }`}
    >
      {children}
    </button>
  );
}

/** "12,5" e "12.5" valem igual — o teclado em português usa vírgula. */
export function paraNumero(texto: string): number | null {
  const t = texto.trim().replace(',', '.');
  if (t === '') return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}
