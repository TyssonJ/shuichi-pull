import { Faixa } from '@/components/layout/Faixa';
import { Boot } from '@/components/alter-ego/Boot';
import { listarPersonagens } from '@/lib/dados';

export default function Inicio() {
  const total = listarPersonagens().length;

  return (
    <>
      <Boot />

      <section className="relative overflow-hidden bg-bg px-4 py-12">
        <span
          aria-hidden
          className="pointer-events-none absolute -left-3 top-2 select-none text-7xl font-black leading-none tracking-tighter text-white/5 sm:text-9xl"
        >
          SHUICHI
        </span>
        <p className="relative font-mono text-[9px] tracking-[.2em] text-teal">
          ARQUIVO DA COMUNIDADE BR/PT
        </p>
        <h1 className="relative mt-2 text-5xl font-black leading-[.9] tracking-tight text-[#F2F2F5] sm:text-6xl">
          O caso está<br /><span className="text-teal">aberto.</span>
        </h1>
        <p className="relative mt-3 max-w-md text-[12px] leading-relaxed text-dim">
          Tudo sobre o Shinri Trial, o Danganronpa Online do Garry&apos;s Mod, em português.
        </p>
      </section>

      <Faixa numero="01" titulo="ELENCO" variante="teal" url="/elenco/"
        descricao={`${total} alunos: atributos, velocidade, itens iniciais e dicas de RP.`} />
      <Faixa numero="02" titulo="ITENS" variante="papel" url="/itens/"
        descricao="162 itens: peso, raridade, onde spawnam e o que craftam." />
      <Faixa numero="03" titulo="MAPA" variante="escura" url="/mapa/"
        descricao="Cada local da academia, o que spawna lá e para onde conecta." />
    </>
  );
}
