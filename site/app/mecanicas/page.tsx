import { tabelasDeTeclas, mecanicasPorGrupoComCorrecoes, cardsDeMecanicaComCorrecoes } from '@/lib/controles';
import { Prosa } from '@/components/conteudo/Prosa';
import { Tecla } from '@/components/conteudo/Tecla';
import { JanelaTerminal } from '@/components/mecanicas/JanelaTerminal';
import { PainelComTrilhas } from '@/components/layout/PainelComTrilhas';

export const metadata = { title: 'Mecânicas e Controles — Shuichi Pull' };

export default async function PaginaMecanicas() {
  const tabelas = tabelasDeTeclas();
  const grupos = await mecanicasPorGrupoComCorrecoes();
  const totalCards = (await cardsDeMecanicaComCorrecoes()).length;

  return (
    <PainelComTrilhas>
      <p className="font-mono text-[8px] tracking-[.2em] text-dim">ARQUIVO 05</p>
      <h1 className="mb-1 text-4xl font-black tracking-tight text-[#F2F2F5]">
        MECÂNICAS
      </h1>
      <p className="mb-6 text-[11px] text-dim">
        Todas as teclas e {totalCards} mecânicas explicadas, em português.
      </p>

      <JanelaTerminal>
        <section className="mb-10">
          <h2 className="mb-4 font-mono text-[10px] tracking-[.14em] text-alter-green">
            &gt; TECLAS_
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            {tabelas.map((t) => (
              <div key={t.grupo} className="rounded-[4px] border border-[#0F5A2E] bg-[#062710]/60 p-3">
                <h3 className="mb-3 font-mono text-[9px] tracking-[.14em] text-alter-green">
                  {t.grupo.toUpperCase()}
                </h3>
                <dl className="space-y-2.5">
                  {t.teclas.map((k, i) => (
                    <div key={`${k.teclas}-${i}`} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <dt className="shrink-0"><Tecla combinacao={k.teclas} /></dt>
                      <dd className="flex-1 text-[11px] text-[#B9E6C8]">
                        {k.descricao}
                        {k.nota && (
                          <span className="mt-0.5 block font-mono text-[8px] text-alter-green/50">{k.nota}</span>
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
              className="rounded-[2px] border border-[#0F5A2E] px-2 py-1 font-mono text-[8px] tracking-[.1em] text-alter-green/70 hover:border-alter-green hover:text-alter-green"
            >
              {g.grupo.toUpperCase()} · {g.cards.length}
            </a>
          ))}
        </nav>

        {grupos.map((g) => (
          <section key={g.grupo} id={encodeURIComponent(g.grupo)} className="mb-10 scroll-mt-16">
            <h2 className="mb-4 font-mono text-[10px] tracking-[.14em] text-alter-green">
              &gt; {g.grupo.toUpperCase()}_
            </h2>

            <div className="grid gap-3 md:grid-cols-2">
              {g.cards.map((c) => (
                <article
                  key={c.id}
                  id={c.id}
                  className="relative scroll-mt-16 rounded-[4px] border-2 border-[#0F5A2E] bg-[#062710]/40 p-3 pb-5"
                >
                  <h3 className="mb-2 font-mono text-[11px] font-bold tracking-[.04em] text-[#D6F5E0]">
                    {c.titulo}
                  </h3>
                  <Prosa texto={c.texto} />
                  <span
                    aria-hidden
                    className="absolute bottom-1.5 right-2 animate-pulse font-mono text-[9px] text-alter-green"
                  >
                    ▼
                  </span>
                </article>
              ))}
            </div>
          </section>
        ))}
      </JanelaTerminal>
    </PainelComTrilhas>
  );
}
