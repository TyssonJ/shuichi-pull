import { listarCodigos, separarCodigos, estaExpirado } from '@/lib/eventos';
import { obterTextos } from '@/lib/textos';
import { StatusCodigo } from '@/components/conteudo/StatusCodigo';
import { PainelComTrilhas } from '@/components/layout/PainelComTrilhas';

export const metadata = { title: 'Códigos — Shuichi Pull' };

export default async function PaginaCodigos() {
  const todos = await listarCodigos();
  const { ativos } = await separarCodigos();

  return (
    <PainelComTrilhas>
      <p className="font-mono text-[8px] tracking-[.2em] text-dim">ARQUIVO 07</p>
      <h1 className="mb-1 text-4xl font-black tracking-tight text-[#F2F2F5]">CÓDIGOS</h1>
      <p className="mb-8 max-w-2xl text-[11px] text-dim">
        {(await obterTextos())('codigos.introducao')}
      </p>

      {todos.length === 0 ? (
        <div className="max-w-2xl rounded-[4px] border border-line bg-sur p-4">
          <p className="mb-2 text-[12px] text-[#D6D6E0]">
            Nenhum código cadastrado ainda.
          </p>
          <p className="text-[11px] leading-relaxed text-dim">
            A administração adiciona códigos em <code className="rounded-[2px] bg-[#22222C] px-1 font-mono text-alter-green">content/codigos.json</code>,
            com código, recompensa, descrição, data de expiração e a fonte onde ele
            foi anunciado.
          </p>
        </div>
      ) : (
        <ul className="mx-auto grid max-w-3xl gap-2.5 sm:grid-cols-2">
          {todos.map((c) => (
            <li
              key={c.codigo}
              className={`rounded-[4px] border bg-sur p-3 ${
                estaExpirado(c) ? 'border-line opacity-60' : 'border-ego-escuro'
              }`}
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <code className="rounded-[3px] border border-line bg-[#14141A] px-2 py-1 font-mono text-[13px] font-bold tracking-[.1em] text-[#F2F2F5]">
                  {c.codigo}
                </code>
                <StatusCodigo expiraEm={c.expiraEm} expiradoNoBuild={estaExpirado(c)} />
              </div>
              <div className="flex items-center gap-2">
                {c.iconeUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.iconeUrl} alt="" className="h-8 w-8 shrink-0 rounded object-contain" />
                )}
                <p className="text-[12px] font-bold text-alter-green">{c.recompensa}</p>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-dim">{c.descricao}</p>
              {c.fonte && (
                <a
                  href={c.fonte}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block font-mono text-[8px] text-dim underline hover:text-alter-green"
                >
                  onde foi anunciado
                </a>
              )}
            </li>
          ))}
        </ul>
      )}

      {ativos.length > 0 && (
        <p className="mt-6 text-center font-mono text-[8px] text-dim">
          {ativos.length} de {todos.length} códigos funcionando agora.
        </p>
      )}
    </PainelComTrilhas>
  );
}
