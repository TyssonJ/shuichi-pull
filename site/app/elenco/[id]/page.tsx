import { notFound } from 'next/navigation';
import Link from 'next/link';
import { buscarPersonagem, listarPersonagens, valoresDoElenco } from '@/lib/dados';
import { Regua } from '@/components/dados/Regua';
import { CarteirinhaEstudante } from '@/components/ficha/CarteirinhaEstudante';

export function generateStaticParams() {
  return listarPersonagens().map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = buscarPersonagem(id);
  return p
    ? { title: `${p.nome} — Shuichi Pull`, description: p.descricao.pt }
    : { title: 'Personagem não encontrado — Shuichi Pull' };
}

export default async function FichaPersonagem({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = buscarPersonagem(id);
  if (!p) notFound();

  const todos = listarPersonagens();
  const total = todos.length;
  const numero = todos.findIndex((x) => x.id === id) + 1;

  return (
    <article className="mx-auto max-w-[1400px] px-4 py-8 xl:grid xl:grid-cols-[280px_minmax(0,1fr)_320px] xl:gap-10">
      <Link href="/elenco/" className="font-mono text-[9px] text-dim hover:text-alter-green xl:col-span-3">
        ← todo o elenco
      </Link>

      <div className="relative mx-auto mt-4 w-40 xl:mx-0 xl:mt-6 xl:w-full">
        <CarteirinhaEstudante personagem={p} numero={numero} />
      </div>

      <header className="mt-6 min-w-0 xl:mt-6">
        <p className="font-mono text-[8px] tracking-[.2em] text-dim">{p.jogo}</p>
        <h1 className="mt-1 text-3xl font-black leading-[.95] tracking-tight text-[#F2F2F5] sm:text-4xl">
          {p.nome}
        </h1>
        <p className="mt-1 font-serif text-[17px] italic leading-tight text-alter-green">
          {p.talento.pt}
        </p>
        <p className="font-mono text-[9px] text-dim">{p.talento.en}</p>

        <p className="mt-4 max-w-prose text-[13px] leading-relaxed text-[#C8C8D4]">
          {p.descricao.pt}
        </p>

        {p.etiquetas.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {p.etiquetas.map((e) => (
              <li
                key={e.en}
                title={e.en}
                className="rounded-[2px] border px-1.5 py-0.5 font-mono text-[8px]"
                style={{
                  color: e.bom ? 'var(--color-alter-green)' : 'var(--color-alerta)',
                  borderColor: 'currentColor',
                }}
              >
                {e.pt}
              </li>
            ))}
          </ul>
        )}
      </header>

      <section className="mt-8 xl:mt-6">
        <h2 className="mb-1 flex items-center gap-2 font-serif text-[11px] tracking-[.14em] text-[#B9B9C6]">
          <span className="h-px flex-1 bg-line" />
          — // ANÁLISE // —
          <span className="h-px flex-1 bg-line" />
        </h2>
        <p className="mb-4 text-center font-mono text-[7px] tracking-[.1em] text-dim">
          DE {total} ALUNOS
        </p>

        <dl className="mb-6 grid grid-cols-2 gap-x-4 gap-y-1.5 border-b border-line pb-4">
          <div className="flex items-baseline gap-1.5">
            <dt className="font-mono text-[7px] tracking-[.1em] text-dim">VIDA</dt>
            <dd className="font-mono text-[11px] font-bold text-[#D6D6E0]">{p.vida}</dd>
          </div>
          <div className="flex items-baseline gap-1.5">
            <dt className="font-mono text-[7px] tracking-[.1em] text-dim">VELOCIDADE</dt>
            <dd className="font-mono text-[11px] font-bold text-[#D6D6E0]">{p.velocidade}</dd>
          </div>
          <div className="flex items-baseline gap-1.5">
            <dt className="font-mono text-[7px] tracking-[.1em] text-dim">MOCHILA</dt>
            <dd className="font-mono text-[11px] font-bold text-[#D6D6E0]">{p.mochila}</dd>
          </div>
          <div className="flex items-baseline gap-1.5">
            <dt className="font-mono text-[7px] tracking-[.1em] text-dim">PERCEPÇÃO</dt>
            <dd className="font-mono text-[11px] font-bold text-[#D6D6E0]">{p.percepcao}</dd>
          </div>
        </dl>

        <Regua
          nome="VELOCIDADE" valor={p.velocidade} unidade="u/s"
          valores={valoresDoElenco('velocidade')} passo={5}
          maiorEhMelhor sentido="mais rápido"
        />
        <Regua
          nome="MOCHILA" valor={p.mochila} unidade="unid."
          valores={valoresDoElenco('mochila')} passo={1}
          maiorEhMelhor sentido="carrega mais"
        />
        <Regua
          nome="PERCEPÇÃO" valor={p.percepcao} unidade="de 10"
          valores={valoresDoElenco('percepcao')} passo={1}
          maiorEhMelhor sentido="enxerga mais"
        />
      </section>

      {!p.traducaoRevisada && (
        <p className="mt-10 text-center font-mono text-[8px] text-dim xl:col-span-3">
          Tradução ainda não revisada por um ADM.
        </p>
      )}
    </article>
  );
}
