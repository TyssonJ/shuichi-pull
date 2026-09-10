import { notFound } from 'next/navigation';
import Link from 'next/link';
import { buscarEvento, listarEventos } from '@/lib/eventos';
import { Prosa } from '@/components/conteudo/Prosa';
import { PainelComTrilhas } from '@/components/layout/PainelComTrilhas';

export async function generateStaticParams() {
  return (await listarEventos()).map((e) => ({ id: e.id }));
}

function formatar(data: string): string {
  return data.split('-').reverse().join('/');
}

export default async function PaginaEvento({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const evento = await buscarEvento(id);
  if (!evento) notFound();

  return (
    <PainelComTrilhas as="article">
      <Link href="/eventos/" className="font-mono text-[9px] text-dim hover:text-alter-green">
        ← todos os eventos
      </Link>

      <header className="mt-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <time dateTime={evento.data} className="font-mono text-[8px] tracking-[.14em] text-dim">
            {formatar(evento.data)}
            {evento.ate && ` — ${formatar(evento.ate)}`}
          </time>
          <span className="font-mono text-[8px] text-dim">por {evento.autor}</span>
        </div>
        <h1 className="text-3xl font-black leading-tight tracking-tight text-[#F2F2F5]">
          {evento.titulo}
        </h1>
        <p className="mt-2 text-[12px] leading-relaxed text-dim">{evento.resumo}</p>
      </header>

      <div className="mt-6 border-t border-line pt-6">
        <Prosa texto={evento.corpo} />
      </div>
    </PainelComTrilhas>
  );
}
