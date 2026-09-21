'use client';

import { definirModoLeve } from '@/lib/modo-leve';
import { useModoLeve } from '@/lib/use-modo-leve';

const DICA = 'Modo leve: tira animações e efeitos pesados. Ajuda em celular e computador fraco.';

/** Só o ícone, pro cabeçalho (no celular o botão vai dentro do menu). */
export function BotaoModoLeveCompacto({ className = '' }: { className?: string }) {
  const leve = useModoLeve();
  return (
    <button
      type="button"
      aria-pressed={leve}
      aria-label="Modo leve"
      title={leve ? 'Modo leve ligado — clique pra voltar ao visual completo' : DICA}
      onClick={() => definirModoLeve(!leve)}
      className={`shrink-0 rounded-[2px] border-2 px-2 py-1.5 font-mono text-[14px] leading-none ${
        leve ? 'border-alter-green bg-alter-green text-[#08090D]' : 'border-line text-dim hover:border-alter-green hover:text-alter-green'
      } ${className}`}
    >
      ⚡
    </button>
  );
}

/** Com texto, pro menu do celular e pro rodapé. */
export function BotaoModoLeve({ className = '' }: { className?: string }) {
  const leve = useModoLeve();
  return (
    <button
      type="button"
      aria-pressed={leve}
      title={DICA}
      onClick={() => definirModoLeve(!leve)}
      className={className}
    >
      ⚡ MODO LEVE: {leve ? 'LIGADO' : 'DESLIGADO'}
    </button>
  );
}
