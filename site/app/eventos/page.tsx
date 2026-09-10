import Link from 'next/link';
import { listarEventos } from '@/lib/eventos';
import { PainelComTrilhas } from '@/components/layout/PainelComTrilhas';

export const metadata = { title: 'Eventos e notícias — Shuichi Pull' };

const ROTULO: Record<string, string> = {
  evento: 'EVENTO', noticia: 'NOTÍCIA', atualizacao: 'ATUALIZAÇÃO',
};

function formatar(data: string): string {
  return data.split('-').reverse().join('/');
}

export default function PaginaEventos() {
  const eventos = listarEventos();

  return (
    <PainelComTrilhas>
      <p className="font-mono text-[8px] tracking-[.2em] text-dim">ARQUIVO 06</p>
      <h1 className="mb-1 text-4xl font-black tracking-tight text-[#F2F2F5]">EVENTOS</h1>
      <p className="mb-8 max-w-2xl text-[11px] text-dim">
        Eventos, notícias e mudanças no site, escritos pela administração. Não é
        fonte oficial de anúncios do Shinri Trial — para isso, o Discord oficial.
      </p>

      {eventos.length === 0 ? (
        <p className="rounded-[4px] border border-line bg-sur p-4 text-[12px] text-dim">
          Ainda não há nada publicado por aqui.
        </p>
      ) : (
        <ul className="mx-auto max-w-2xl space-y-3">
          {eventos.map((e) => (
            <li key={e.id}>
              <Link
                href={`/eventos/${e.id}/`}
                className={`block rounded-[4px] border bg-sur p-3 transition-colors hover:border-alter-green ${
                  e.destaque ? 'border-ego-escuro' : 'border-line'
                }`}
              >
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  <span className="rounded-[2px] border border-line px-1.5 py-px font-mono text-[8px] tracking-[.1em] text-dim">
                    {ROTULO[e.tipo] ?? e.tipo.toUpperCase()}
                  </span>
                  <time dateTime={e.data} className="font-mono text-[8px] text-dim">
                    {formatar(e.data)}
                    {e.ate && ` — ${formatar(e.ate)}`}
                  </time>
                  {e.destaque && (
                    <span className="font-mono text-[8px] tracking-[.1em] text-alter-green">EM DESTAQUE</span>
                  )}
                </div>
                <p className="text-[13px] font-bold leading-tight text-[#D6D6E0]">{e.titulo}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-dim">{e.resumo}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PainelComTrilhas>
  );
}
