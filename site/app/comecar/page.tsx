import Link from 'next/link';
import { conteudoIniciantes } from '@/lib/iniciantes';
import { Prosa } from '@/components/conteudo/Prosa';
import { Papel } from '@/components/ficha/Papel';
import { listarPersonagensComCorrecoes } from '@/lib/dados-corrigidos';
import { listarItensComCorrecoes, listarLocaisComCorrecoes } from '@/lib/itens-corrigidos';

export const metadata = {
  title: 'Começar aqui — Shuichi Pull',
  description:
    'O que é Danganronpa, o que é Shinri Trial e o passo a passo para entrar na sua primeira partida, em português.',
};

export default async function PaginaIniciantes() {
  const c = conteudoIniciantes();
  const totalPersonagens = (await listarPersonagensComCorrecoes()).length;
  const totalItens = (await listarItensComCorrecoes()).length;
  const totalLocais = (await listarLocaisComCorrecoes()).length;

  return (
    <div className="px-4 py-8">
      <header className="relative overflow-hidden">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-3 -top-3 select-none text-6xl font-black leading-none tracking-tighter text-white/5 sm:text-8xl"
        >
          COMEÇAR
        </span>
        <p className="relative font-mono text-[8px] tracking-[.2em] text-dim">ARQUIVO 00</p>
        <h1 className="relative mb-2 max-w-xl text-4xl font-black leading-[.95] tracking-tight text-[#F2F2F5]">
          {c.chamada}
        </h1>
        <p className="relative max-w-2xl text-[12px] leading-relaxed text-dim">{c.resumo}</p>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-10">
          {c.blocos.map((b) => (
            <section key={b.id} id={b.id} className="scroll-mt-16">
              <h2 className="mb-3 font-serif text-[15px] tracking-[.1em] text-[#E2E2EA]">
                {b.titulo}
              </h2>
              <Prosa texto={b.texto} />
            </section>
          ))}

          <section id="como-funciona-uma-partida" className="scroll-mt-16">
            <h2 className="mb-1 font-serif text-[15px] tracking-[.1em] text-[#E2E2EA]">
              Como uma partida funciona
            </h2>
            <p className="mb-4 text-[11px] text-dim">
              Uma sessão tem 16 estudantes e roda em capítulos. Cada capítulo passa por
              quatro fases, nesta ordem.
            </p>

            <ol className="space-y-2">
              {c.fases.map((f) => (
                <li
                  key={f.n}
                  className="flex gap-3 rounded-[4px] border border-line bg-sur p-3"
                >
                  <span
                    aria-hidden
                    className="font-mono text-[18px] font-black leading-none text-ego-escuro"
                  >
                    {f.n}
                  </span>
                  <div className="min-w-0">
                    <p className="mb-1 font-mono text-[10px] font-bold tracking-[.14em] text-alter-green">
                      {f.nome.toUpperCase()}
                    </p>
                    <Prosa texto={f.texto} />
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section id="como-comecar" className="scroll-mt-16">
            <h2 className="mb-4 font-serif text-[15px] tracking-[.1em] text-[#E2E2EA]">
              Como começar a jogar
            </h2>
            <ol className="space-y-3">
              {c.passos.map((p) => (
                <li key={p.n} className="flex gap-3">
                  <span
                    aria-hidden
                    className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-ego-escuro font-mono text-[9px] font-bold text-alter-green"
                  >
                    {p.n}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[12px] font-bold text-[#D6D6E0]">{p.titulo}</p>
                    <Prosa texto={p.texto} />
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="space-y-6">
          <Papel titulo="DICAS DE QUEM JÁ JOGA">
            <ul className="space-y-2">
              {c.dicas.map((d) => (
                <li key={d} className="flex gap-2 text-[12px] leading-relaxed">
                  <span aria-hidden className="text-dim/40">—</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </Papel>

          <section className="rounded-[4px] border border-line bg-sur p-3">
            <h2 className="mb-3 font-mono text-[9px] tracking-[.14em] text-dim">
              LINKS QUE VOCÊ VAI PRECISAR
            </h2>
            <ul className="space-y-3">
              {c.links.map((l) => (
                <li key={l.url}>
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[12px] font-bold text-alter-green hover:underline"
                  >
                    {l.rotulo}
                  </a>
                  <p className="text-[10px] leading-relaxed text-dim">{l.descricao}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-[4px] border border-ego-escuro bg-[#12201F] p-3">
            <h2 className="mb-2 font-mono text-[9px] tracking-[.14em] text-alter-green">
              JÁ ENTENDEU? ENTRA NO ARQUIVO
            </h2>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <Link href="/elenco/" className="text-[#D6D6E0] hover:text-alter-green">
                  Elenco — {totalPersonagens} alunos e seus atributos
                </Link>
              </li>
              <li>
                <Link href="/itens/" className="text-[#D6D6E0] hover:text-alter-green">
                  Itens — {totalItens} itens, receitas e onde spawnam
                </Link>
              </li>
              <li>
                <Link href="/mapa/" className="text-[#D6D6E0] hover:text-alter-green">
                  Mapa — {totalLocais} locais da academia
                </Link>
              </li>
              <li>
                <Link href="/mecanicas/" className="text-[#D6D6E0] hover:text-alter-green">
                  Mecânicas — todas as teclas e mecânicas
                </Link>
              </li>
              <li>
                <Link href="/faq/" className="text-[#D6D6E0] hover:text-alter-green">
                  FAQ — 51 perguntas respondidas
                </Link>
              </li>
              <li>
                <Link href="/conta/" className="text-[#D6D6E0] hover:text-alter-green">
                  Minha Conta — salve seu UUID e seus mains
                </Link>
              </li>
              <li>
                <Link href="/partidas/" className="text-[#D6D6E0] hover:text-alter-green">
                  Partidas — organize ou entre numa sessão
                </Link>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
