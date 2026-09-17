import { listarPersonagensComCorrecoes } from '@/lib/dados-corrigidos';
import { repositorioConfiguracoes } from '@/db/repositorios/configuracoes';
import { obterToggle } from '@/lib/configuracoes';
import { CartaoPersonagem } from '@/components/ficha/CartaoPersonagem';
import { PainelComTrilhas } from '@/components/layout/PainelComTrilhas';

export const metadata = { title: 'Elenco — Shuichi Pull' };

export default async function PaginaElenco() {
  const [personagens, config] = await Promise.all([
    listarPersonagensComCorrecoes(),
    repositorioConfiguracoes.listar(),
  ]);
  const mostrarPendente = obterToggle(config, 'elenco.mostrarBadgePendente');

  // O "Student ID" reflete a ordem global do elenco, não o agrupamento por
  // jogo abaixo — a ficha individual (app/elenco/[id]/page.tsx) calcula o
  // mesmo número a partir da mesma ordem, então os dois lugares sempre
  // concordam (ver spec, seção 3 e 5).
  const numeroPorId = new Map(personagens.map((p, i) => [p.id, i + 1]));

  const porJogo = new Map<string, typeof personagens>();
  for (const p of personagens) {
    porJogo.set(p.jogo, [...(porJogo.get(p.jogo) ?? []), p]);
  }

  return (
    <PainelComTrilhas>
      <p className="font-mono text-[8px] tracking-[.2em] text-dim">ARQUIVO 01</p>
      <h1 className="mb-1 text-4xl font-black tracking-tight text-[#F2F2F5]">ELENCO</h1>
      <p className="mb-8 text-[11px] text-dim">
        {personagens.length} alunos, de {porJogo.size} jogos.
      </p>

      {[...porJogo.entries()].map(([jogo, lista]) => (
        <section key={jogo} className="mb-10">
          <h2 className="mb-3 flex items-center gap-2 font-serif text-[13px] tracking-[.16em] text-[#B9B9C6]">
            <span className="h-px flex-1 bg-line" />
            {jogo}
            <span className="h-px flex-1 bg-line" />
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {lista.map((p) => (
              <CartaoPersonagem
                key={p.id}
                personagem={p}
                numero={numeroPorId.get(p.id)!}
                mostrarPendente={mostrarPendente}
              />
            ))}
          </div>
        </section>
      ))}
    </PainelComTrilhas>
  );
}
