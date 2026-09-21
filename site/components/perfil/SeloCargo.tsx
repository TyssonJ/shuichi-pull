import { corDoTextoSobre } from '@/lib/cargos';

/** Selo de cargo: fundo na cor escolhida pelo ADM, texto que sempre dá leitura. */
export function SeloCargo({ nome, cor, className = '' }: { nome: string; cor: string; className?: string }) {
  return (
    <span
      className={`inline-block rounded-[2px] px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-[.1em] ${className}`}
      style={{ backgroundColor: cor, color: corDoTextoSobre(cor) }}
    >
      {nome}
    </span>
  );
}
