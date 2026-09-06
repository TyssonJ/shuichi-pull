import { notFound } from 'next/navigation';
import Link from 'next/link';
import { buscarItem, listarItens, receitasQueUsam } from '@/lib/itens';
import { Selo } from '@/components/itens/Selo';
import { Icone } from '@/components/itens/Icone';
import { Receita } from '@/components/itens/Receita';
import { BarraSpawn } from '@/components/itens/BarraSpawn';
import { Papel } from '@/components/ficha/Papel';

export function generateStaticParams() {
  return listarItens().map((i) => ({ id: i.id }));
}

const ROTULO_MECANICA: Record<string, string> = {
  hp: 'Vida', hunger: 'Fome', vigor: 'Vigor', buff: 'Efeito',
  cures: 'Cura', applies: 'Aplica', extra: 'Extra',
};

export default async function FichaItem({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = buscarItem(id);
  if (!item) notFound();

  const usadoEm = receitasQueUsam(item.id);
  const mecanicas = Object.entries(item.mecanicas);

  return (
    <article className="px-4 py-8">
      <header className="relative overflow-hidden">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-3 -top-2 select-none text-5xl font-black leading-none tracking-tighter text-white/5 sm:text-7xl"
        >
          {item.categoria.pt.toUpperCase()}
        </span>
        <div className="relative flex items-start gap-4">
          <Icone src={item.icone} nome={item.nome.pt} className="h-16 w-16 sm:h-20 sm:w-20" />
          <div className="min-w-0">
            <p className="font-mono text-[8px] tracking-[.2em] text-dim">
              {item.categoria.pt} · {item.ramo.pt}
            </p>
            <h1 className="text-4xl font-black tracking-tight text-[#F2F2F5]">
              {item.nome.pt}
            </h1>
            <p className="mb-3 font-mono text-[9px] text-dim">{item.nome.en}</p>
          </div>
        </div>
        <div className="relative mt-3 flex flex-wrap items-center gap-2">
          <Selo raridade={item.raridade} nivel={item.nivelRaridade} comIngles />
          {item.peso !== null && (
            <span className="font-mono text-[9px] text-dim">Peso {item.peso} kg</span>
          )}
          {item.loja && (
            <span className="font-mono text-[9px] text-teal">
              Loja: {item.loja.preco} monomoedas
            </span>
          )}
        </div>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="min-w-0">
          {item.efeito && (
            <section className="mb-6">
              <h2 className="mb-2 font-mono text-[8px] tracking-[.14em] text-dim">EFEITO</h2>
              <p className="text-[12px] text-[#D6D6E0]">{item.efeito.pt}</p>
            </section>
          )}

          {mecanicas.length > 0 && (
            <section className="mb-6">
              <h2 className="mb-2 font-mono text-[8px] tracking-[.14em] text-dim">NÚMEROS</h2>
              <dl className="space-y-1">
                {mecanicas.map(([chave, valores]) => (
                  <div key={chave} className="flex gap-2 text-[11px]">
                    <dt className="w-20 shrink-0 font-mono text-[9px] text-dim">
                      {ROTULO_MECANICA[chave] ?? chave}
                    </dt>
                    <dd className="text-[#D6D6E0]">{valores.join(', ')}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {item.craft && (
            <section className="mb-6">
              <h2 className="mb-2 font-mono text-[8px] tracking-[.14em] text-dim">COMO FABRICAR</h2>
              <Receita craft={item.craft} resultado={item.nome.pt} iconeResultado={item.icone} />
            </section>
          )}

          {usadoEm.length > 0 && (
            <section className="mb-6">
              <h2 className="mb-2 font-mono text-[8px] tracking-[.14em] text-dim">
                SERVE PARA FABRICAR
              </h2>
              <ul className="flex flex-wrap gap-1.5">
                {usadoEm.map((u) => (
                  <li key={u.id}>
                    <Link
                      href={`/itens/${u.id}/`}
                      className="rounded-[2px] border border-line px-1.5 py-0.5 text-[10px] text-[#D6D6E0] hover:border-teal hover:text-teal"
                    >
                      {u.nome.pt}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="min-w-0">
          <h2 className="mb-2 font-mono text-[8px] tracking-[.14em] text-dim">
            ONDE APARECE {item.spawns.length > 0 && `· ${item.spawns.length} contêineres`}
          </h2>
          <BarraSpawn spawns={item.spawns} />
        </div>
      </div>

      {item.descricao && (
        <div className="mt-8 max-w-2xl">
          <Papel titulo="DESCRIÇÃO">
            <p className="text-[12px] leading-relaxed">{item.descricao.pt}</p>
            {!item.traducaoRevisada && (
              <p className="mt-3 font-mono text-[8px] text-tinta/50">
                Tradução ainda não revisada por um ADM.
              </p>
            )}
          </Papel>
        </div>
      )}
    </article>
  );
}
