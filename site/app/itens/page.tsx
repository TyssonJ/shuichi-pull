import { categoriasComTotal } from '@/lib/itens';
import { listarItensComCorrecoes } from '@/lib/itens-corrigidos';
import { CartaoItem } from '@/components/itens/CartaoItem';
import { RARIDADES } from '@/lib/vocabulario';

export const metadata = { title: 'Itens — Shuichi Pull' };

export default async function PaginaItens() {
  const itens = await listarItensComCorrecoes();
  // categoriasComTotal() segue sincrono e le a lista base de itens: labels de
  // categoria corrigidas por um ADM so aparecem aqui no proximo deploy. Gap
  // aceito e documentado (Task 13, Passo 5) — categoria e um campo raro de
  // corrigir e async-ificar so isso seria desproporcional.
  const categorias = categoriasComTotal();

  // Agrupa por categoria; dentro dela, do mais raro para o mais comum.
  const porCategoria = categorias.map((c) => ({
    categoria: c,
    lista: itens
      .filter((i) => i.categoria.en === c.en)
      .sort((a, b) => b.nivelRaridade - a.nivelRaridade
        || a.nome.pt.localeCompare(b.nome.pt, 'pt-BR')),
  }));

  return (
    <div className="px-4 py-8">
      <p className="font-mono text-[8px] tracking-[.2em] text-dim">ARQUIVO 02</p>
      <h1 className="mb-1 text-4xl font-black tracking-tight text-[#F2F2F5]">ITENS</h1>
      <p className="mb-6 text-[11px] text-dim">
        {itens.length} itens: peso, raridade, receita e onde cada um aparece.
      </p>

      <div className="mb-8 flex flex-wrap items-center gap-2 border-y border-line py-2">
        <span className="font-mono text-[8px] tracking-[.14em] text-dim">RARIDADE</span>
        {RARIDADES.map((r) => (
          <span key={r.en} className="font-mono text-[8px] text-dim">
            {r.pt} ({itens.filter((i) => i.nivelRaridade === r.nivel).length})
          </span>
        ))}
      </div>

      {porCategoria.map(({ categoria, lista }) => (
        <section key={categoria.en} className="mb-10">
          <h2 className="mb-3 flex items-center gap-2 font-serif text-[13px] tracking-[.16em] text-[#B9B9C6]">
            <span className="h-px flex-1 bg-line" />
            {categoria.pt}
            <span className="font-mono text-[8px] text-dim">{categoria.en} · {lista.length}</span>
            <span className="h-px flex-1 bg-line" />
          </h2>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
            {lista.map((i) => <CartaoItem key={i.id} item={i} />)}
          </div>
        </section>
      ))}
    </div>
  );
}
