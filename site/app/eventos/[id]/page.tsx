import { notFound } from 'next/navigation';
import { identidadeDe } from '@/lib/identidade';
import Link from 'next/link';
import { auth } from '@/auth';
import { buscarEvento } from '@/lib/eventos';
import { repositorioEventoComentarios } from '@/db/repositorios/eventos-comentarios';
import { repositorioUsuarios } from '@/db/repositorios/usuarios';
import { Prosa } from '@/components/conteudo/Prosa';
import { PainelComTrilhas } from '@/components/layout/PainelComTrilhas';
import { Comentarios, type ComentarioExibido } from '@/components/eventos/Comentarios';
import { comentarAction, removerComentarioAction } from './acoes';

// Sem generateStaticParams: a página precisa de sessão (auth()) e dos
// comentários mais recentes a cada visita, então já renderiza sob demanda —
// diferente de /elenco e /itens, que continuam SSG porque o conteúdo é
// igual pra todo mundo.

function formatar(data: string): string {
  return data.split('-').reverse().join('/');
}

export default async function PaginaEvento({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const evento = await buscarEvento(id);
  if (!evento) notFound();

  const [sessao, comentariosBrutos] = await Promise.all([
    auth(),
    repositorioEventoComentarios.listar(id),
  ]);

  const autores = new Map(
    await Promise.all(
      [...new Set(comentariosBrutos.map((c) => c.discordId))].map(
        async (discordId) => [discordId, await repositorioUsuarios.buscar(discordId)] as const
      )
    )
  );

  const comentarios: ComentarioExibido[] = comentariosBrutos.map((c) => ({
    id: c.id,
    discordId: c.discordId,
    texto: c.texto,
    criadoEm: c.criadoEm.toISOString(),
    autorNome: autores.get(c.discordId) ? identidadeDe(autores.get(c.discordId)!).nome : 'alguém',
    autorNomeOriginal: autores.get(c.discordId) ? identidadeDe(autores.get(c.discordId)!).nomeOriginal : null,
    autorAvatar: autores.get(c.discordId) ? identidadeDe(autores.get(c.discordId)!).avatar : null,
  }));

  return (
    <PainelComTrilhas as="article">
      <Link href="/eventos/" className="font-mono text-[9px] text-dim hover:text-alter-green">
        ← todos os eventos
      </Link>

      {evento.imagemUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={evento.imagemUrl}
          alt=""
          className="mt-4 h-56 w-full rounded-[4px] border border-line object-cover"
        />
      )}

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

      <Comentarios
        eventoId={evento.id}
        comentarios={comentarios}
        discordIdAtual={sessao?.user?.discordId ?? null}
        souAdm={sessao?.user?.papel === 'adm' || sessao?.user?.papel === 'chefe'}
        aoComentar={comentarAction}
        aoRemover={removerComentarioAction}
      />
    </PainelComTrilhas>
  );
}
