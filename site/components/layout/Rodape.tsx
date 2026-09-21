import Link from 'next/link';
import { BotaoModoLeve } from './BotaoModoLeve';

export function Rodape() {
  return (
    <footer className="mt-16 border-t border-line px-4 py-8 text-[9px] leading-relaxed text-dim">
      <p className="mb-2 font-mono tracking-[.12em] text-[#B9B9C6]">SHUICHI PULL</p>
      <p className="max-w-2xl">
        Site feito pela comunidade brasileira e portuguesa. Não é fonte oficial de
        notícias, anúncios ou informações sobre o Shinri Trial.
      </p>
      <p className="mt-2 max-w-2xl">
        Personagens e sprites são propriedade da Spike Chunsoft. Dados de jogo
        conferidos com a extração do Kirigiri Press. Obrigado à equipe do Shinri Trial.
      </p>
      <Link
        href="/conta/"
        className="mt-4 inline-block font-mono text-[9px] tracking-[.1em] text-alter-green hover:underline"
      >
        [ MINHA CONTA ]
      </Link>
      <BotaoModoLeve className="ml-4 mt-4 inline-block font-mono text-[9px] tracking-[.1em] text-dim hover:text-alter-green hover:underline" />
    </footer>
  );
}
