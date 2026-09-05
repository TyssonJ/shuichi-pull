import { Fragment } from 'react';

/**
 * O texto das traduções é markdown mínimo: parágrafo em branco duplo, lista
 * com traço, **negrito**, `código` e link solto. É o suficiente para o ADM
 * escrever sem precisar de editor, e não abre a porta para HTML arbitrário.
 */
const PEDACO = /(\*\*[^*]+\*\*|`[^`]+`|(?:https?:\/\/)?(?:[\w-]+\.)+(?:ru|com|gg|be|red|me)\S*)/g;
const LINK = /^(?:https?:\/\/)?(?:[\w-]+\.)+(?:ru|com|gg|be|red|me)\S*$/;

function formatar(texto: string, chave: string) {
  return texto.split(PEDACO).filter(Boolean).map((pedaco, i) => {
    const k = `${chave}-${i}`;
    if (/^\*\*[^*]+\*\*$/.test(pedaco)) {
      return <strong key={k} className="font-bold text-[#F2F2F5]">{pedaco.slice(2, -2)}</strong>;
    }
    if (/^`[^`]+`$/.test(pedaco)) {
      return (
        <code key={k} className="rounded-[2px] bg-[#22222C] px-1 font-mono text-[.92em] text-teal">
          {pedaco.slice(1, -1)}
        </code>
      );
    }
    if (LINK.test(pedaco)) {
      const href = pedaco.startsWith('http') ? pedaco : `https://${pedaco}`;
      return (
        <a key={k} href={href} target="_blank" rel="noreferrer"
           className="text-teal underline underline-offset-2 hover:text-papel">
          {pedaco}
        </a>
      );
    }
    return <Fragment key={k}>{pedaco}</Fragment>;
  });
}

export function Prosa({ texto, className = '' }: { texto: string; className?: string }) {
  const blocos = texto.split(/\n\n+/);

  return (
    <div className={`space-y-2 text-[12px] leading-relaxed text-[#C8C8D4] ${className}`}>
      {blocos.map((bloco, b) => {
        const linhas = bloco.split('\n');
        if (linhas.every((l) => l.trim().startsWith('- '))) {
          return (
            <ul key={b} className="ml-4 list-disc space-y-1">
              {linhas.map((l, i) => (
                <li key={i}>{formatar(l.replace(/^\s*-\s*/, ''), `${b}-${i}`)}</li>
              ))}
            </ul>
          );
        }
        return <p key={b}>{formatar(bloco, String(b))}</p>;
      })}
    </div>
  );
}
