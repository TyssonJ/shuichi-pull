import { tabelasDeTeclas, mecanicasPorGrupo, cardsDeMecanica } from '@/lib/controles';
import { Prosa } from '@/components/conteudo/Prosa';
import { Tecla } from '@/components/conteudo/Tecla';

export const metadata = { title: 'Mecânicas e Controles — Shuichi Pull' };

export default function PaginaMecanicas() {
  const tabelas = tabelasDeTeclas();
  const grupos = mecanicasPorGrupo();

  return (
    <div className="px-4 py-8">
      <p className="font-mono text-[8px] tracking-[.2em] text-dim">ARQUIVO 05</p>
      <h1 className="mb-1 text-4xl font-black tracking-tight text-[#F2F2F5]">
        MECÂNICAS
      </h1>
      <p className="mb-8 text-[11px] text-dim">
        Todas as teclas e {cardsDeMecanica().length} mecânicas explicadas, em português.
      </p>

      <section className="mb-12">
        <h2 className="mb-4 flex items-center gap-2 font-serif text-[13px] tracking-[.16em] text-[#B9B9C6]">
          <span className="h-px flex-1 bg-line" />
          Teclas
          <span className="h-px flex-1 bg-line" />
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          {tabelas.map((t) => (
            <div key={t.grupo} className="rounded-[4px] border border-line bg-sur p-3">
              <h3 className="mb-3 font-mono text-[9px] tracking-[.14em] text-teal">
                {t.grupo.toUpperCase()}
              </h3>
              <dl className="space-y-2">
                {t.teclas.map((k, i) => (
                  <div key={`${k.teclas}-${i}`} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <dt className="shrink-0"><Tecla combinacao={k.teclas} /></dt>
                    <dd className="flex-1 text-[11px] text-[#C8C8D4]">
                      {k.descricao}
                      {k.nota && (
                        <span className="mt-0.5 block font-mono text-[8px] text-dim">{k.nota}</span>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </section>

      <nav aria-label="Grupos de mecânicas" className="mb-8 flex flex-wrap gap-1.5">
        {grupos.map((g) => (
          <a
            key={g.grupo}
            href={`#${encodeURIComponent(g.grupo)}`}
            className="rounded-[2px] border border-line px-2 py-1 font-mono text-[8px] tracking-[.1em] text-dim hover:border-teal hover:text-teal"
          >
            {g.grupo.toUpperCase()} · {g.cards.length}
          </a>
        ))}
      </nav>

      {grupos.map((g) => (
        <section key={g.grupo} id={encodeURIComponent(g.grupo)} className="mb-12 scroll-mt-16">
          <h2 className="mb-4 flex items-center gap-2 font-serif text-[13px] tracking-[.16em] text-[#B9B9C6]">
            <span className="h-px flex-1 bg-line" />
            {g.grupo}
            <span className="h-px flex-1 bg-line" />
          </h2>

          <div className="grid gap-3 md:grid-cols-2">
            {g.cards.map((c) => (
              <article
                key={c.id}
                id={c.id}
                className="scroll-mt-16 rounded-[4px] border border-line bg-sur p-3"
              >
                <h3 className="mb-2 text-[12px] font-bold text-[#D6D6E0]">{c.titulo}</h3>
                <Prosa texto={c.texto} />
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
