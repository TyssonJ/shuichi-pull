import Link from 'next/link';
import { Faixa } from '@/components/layout/Faixa';
import { HeroTitulo } from '@/components/layout/HeroTitulo';
import { Boot } from '@/components/alter-ego/Boot';
import { listarPersonagens } from '@/lib/dados';
import { spriteDoPersonagem } from '@/lib/sprites';

export default function Inicio() {
  const total = listarPersonagens().length;

  return (
    <>
      <Boot />

      <section className="relative overflow-hidden bg-[#08090D] px-4 py-12 clip-hero-diagonal">
        <span
          aria-hidden
          className="pointer-events-none absolute -left-3 top-2 select-none text-7xl font-black leading-none tracking-tighter text-white/5 sm:text-9xl"
        >
          SHUICHI
        </span>
        <p className="relative font-mono text-[9px] tracking-[.2em] text-cyber-cyan">
          ARQUIVO DA COMUNIDADE BR/PT
        </p>
        <HeroTitulo />
        <p className="relative mt-3 max-w-md text-[12px] leading-relaxed text-dim">
          Tudo sobre o Shinri Trial, o Danganronpa Online do Garry&apos;s Mod, em português.
        </p>
        <Link
          href="/comecar/"
          className="active:translate-x-1 active:translate-y-1 active:shadow-none relative mt-5 inline-block border-2 border-white bg-[#08090D] px-3 py-1.5 font-mono text-[10px] tracking-[.14em] text-white shadow-[5px_5px_0px_var(--color-execution-pink)] transition-shadow hover:bg-execution-pink hover:text-[#08090D]"
        >
          NUNCA JOGUEI — COMEÇAR AQUI
        </Link>
      </section>

      <Faixa numero="01" titulo="ELENCO" variante="pink" url="/elenco/"
        sprite={spriteDoPersonagem('shuichi-saihara')}
        descricao={`${total} alunos: atributos, velocidade, itens iniciais e dicas de RP.`} />
      <Faixa numero="02" titulo="ITENS" variante="cyan" url="/itens/"
        descricao="162 itens: peso, raridade, onde spawnam e o que craftam." />
      <Faixa numero="03" titulo="MAPA" variante="escura" url="/mapa/"
        descricao="Cada local da academia, o que spawna lá e para onde conecta." />
    </>
  );
}
