import { faqPorSecao, listarFaq } from '@/lib/faq';
import { Prosa } from '@/components/conteudo/Prosa';

export const metadata = { title: 'FAQ — Shuichi Pull' };

export default function PaginaFaq() {
  const secoes = faqPorSecao();

  return (
    <div className="px-4 py-8">
      <p className="font-mono text-[8px] tracking-[.2em] text-dim">ARQUIVO 04</p>
      <h1 className="mb-1 text-4xl font-black tracking-tight text-[#F2F2F5]">FAQ</h1>
      <p className="mb-6 text-[11px] text-dim">
        {listarFaq().length} perguntas respondidas, em português.
      </p>

      <nav aria-label="Seções do FAQ" className="mb-10 flex flex-wrap gap-1.5">
        {secoes.map((s) => (
          <a
            key={s.secao}
            href={`#${encodeURIComponent(s.secao)}`}
            className="rounded-[2px] border border-line px-2 py-1 font-mono text-[8px] tracking-[.1em] text-dim hover:border-teal hover:text-teal"
          >
            {s.secao.toUpperCase()} · {s.perguntas.length}
          </a>
        ))}
      </nav>

      {secoes.map((s) => (
        <section key={s.secao} id={encodeURIComponent(s.secao)} className="mb-12 scroll-mt-16">
          <h2 className="mb-4 flex items-center gap-2 font-serif text-[13px] tracking-[.16em] text-[#B9B9C6]">
            <span className="h-px flex-1 bg-line" />
            {s.secao}
            <span className="h-px flex-1 bg-line" />
          </h2>

          <div className="mx-auto max-w-2xl space-y-3">
            {s.perguntas.map((p) => (
              <details
                key={p.id}
                id={p.id}
                className="group scroll-mt-16 rounded-[4px] border border-line bg-sur px-3 py-2 open:border-teal-escuro"
              >
                <summary className="cursor-pointer list-none text-[12px] font-bold text-[#D6D6E0] marker:content-none group-open:text-teal">
                  <span className="mr-1.5 font-mono text-[9px] text-dim group-open:text-teal">?</span>
                  {p.pergunta}
                </summary>
                <div className="mt-2 border-t border-line pt-2">
                  <Prosa texto={p.resposta} />
                </div>
              </details>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
