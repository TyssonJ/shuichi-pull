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
    <article className="mx-auto max-w-5xl px-4 py-8">
      <Link href="/elenco/" className="font-mono text-[9px] text-dim hover:text-alter-green">
        ← todo o elenco
      </Link>

      {/* Retrato e identificação, lado a lado: a descrição é a primeira coisa
          que se lê, e os atributos ficam para depois. */}
      <div className="mt-4 grid gap-6 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-8">
        <div className="mx-auto w-40 sm:mx-0 sm:w-full">
          <CarteirinhaEstudante personagem={p} numero={numero} />
        </div>

        <header className="min-w-0">
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

          <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 border-t border-line pt-3">
            <div className="flex items-baseline gap-1.5">
              <dt className="font-mono text-[8px] tracking-[.14em] text-dim">VIDA</dt>
              <dd className="font-mono text-[12px] font-bold text-[#D6D6E0]">{p.vida}</dd>
            </div>
            <div className="flex items-baseline gap-1.5">
              <dt className="font-mono text-[8px] tracking-[.14em] text-dim">VELOCIDADE</dt>
              <dd className="font-mono text-[12px] font-bold text-[#D6D6E0]">{p.velocidade}</dd>
            </div>
            <div className="flex items-baseline gap-1.5">
              <dt className="font-mono text-[8px] tracking-[.14em] text-dim">MOCHILA</dt>
              <dd className="font-mono text-[12px] font-bold text-[#D6D6E0]">{p.mochila}</dd>
            </div>
            <div className="flex items-baseline gap-1.5">
              <dt className="font-mono text-[8px] tracking-[.14em] text-dim">PERCEPÇÃO</dt>
              <dd className="font-mono text-[12px] font-bold text-[#D6D6E0]">{p.percepcao}</dd>
            </div>
          </dl>
        </header>
      </div>

      <section className="mt-12">
        <h2 className="mb-1 flex items-center gap-2 font-serif text-[13px] tracking-[.16em] text-[#B9B9C6]">
          <span className="h-px flex-1 bg-line" />
          — // ANÁLISE DE DADOS DO ALUNO // —
          <span className="h-px flex-1 bg-line" />
        </h2>
        <p className="mb-6 text-center font-mono text-[8px] tracking-[.14em] text-dim">
          CADA COLUNA É QUANTOS DOS {total} ALUNOS TÊM AQUELE VALOR
        </p>

        <div className="mx-auto max-w-3xl">
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
        </div>
      </section>

      {!p.traducaoRevisada && (
        <p className="mt-10 text-center font-mono text-[8px] text-dim">
          Tradução ainda não revisada por um ADM.
        </p>
      )}
    </article>
  );
}
