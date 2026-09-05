import { notFound } from 'next/navigation';
import { buscarPersonagem, listarPersonagens, valoresDoElenco } from '@/lib/dados';
import { Regua } from '@/components/dados/Regua';
import { Papel } from '@/components/ficha/Papel';

export function generateStaticParams() {
  return listarPersonagens().map((p) => ({ id: p.id }));
}

export default async function FichaPersonagem({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = buscarPersonagem(id);
  if (!p) notFound();

  const sobrenome = p.nome.split(' ').slice(-1)[0].toUpperCase();

  return (
    <article className="px-4 py-8">
      <header className="relative overflow-hidden">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-3 -top-2 select-none text-6xl font-black leading-none tracking-tighter text-white/5 sm:text-8xl"
        >
          {sobrenome}
        </span>
        <p className="relative font-mono text-[8px] tracking-[.2em] text-dim">
          {p.jogo}
        </p>
        <h1 className="relative text-4xl font-black tracking-tight text-[#F2F2F5]">
          {p.nome}
        </h1>
        <p className="relative font-serif text-lg italic text-teal">{p.talento.pt}</p>
        <p className="relative font-mono text-[9px] text-dim">{p.talento.en}</p>
      </header>

      <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="mx-auto w-40 shrink-0 sm:mx-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.sprite} alt={`Sprite de ${p.nome}`} className="w-full" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="mb-4 font-mono text-[8px] tracking-[.14em] text-dim">
            ATRIBUTOS · comparado às {listarPersonagens().length} fichas do jogo
          </p>
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

          {p.etiquetas.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {p.etiquetas.map((e) => (
                <li key={e.en}
                  className="rounded-[2px] border px-1.5 py-0.5 font-mono text-[8px]"
                  style={{ color: e.bom ? 'var(--color-teal)' : 'var(--color-red)',
                           borderColor: 'currentColor' }}>
                  {e.pt}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-8 max-w-2xl">
        <Papel titulo="SOBRE">
          <p className="text-[12px] leading-relaxed">{p.descricao.pt}</p>
          {!p.traducaoRevisada && (
            <p className="mt-3 font-mono text-[8px] text-tinta/50">
              Tradução ainda não revisada por um ADM.
            </p>
          )}
        </Papel>
      </div>
    </article>
  );
}
