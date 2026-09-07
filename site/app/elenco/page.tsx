import { listarPersonagensComCorrecoes } from '@/lib/dados-corrigidos';
import { CartaoPersonagem } from '@/components/ficha/CartaoPersonagem';

export const metadata = { title: 'Elenco — Shuichi Pull' };

export default async function PaginaElenco() {
  const personagens = await listarPersonagensComCorrecoes();
  const porJogo = new Map<string, typeof personagens>();
  for (const p of personagens) {
    porJogo.set(p.jogo, [...(porJogo.get(p.jogo) ?? []), p]);
  }

  return (
    <div className="px-4 py-8">
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
            {lista.map((p) => <CartaoPersonagem key={p.id} personagem={p} />)}
          </div>
        </section>
      ))}
    </div>
  );
}
