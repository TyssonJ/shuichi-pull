import { listarItensComCorrecoes } from '@/lib/itens-corrigidos';
import { GradeEvidencias } from '@/components/itens/GradeEvidencias';
import { PainelComTrilhas } from '@/components/layout/PainelComTrilhas';

export const metadata = { title: 'Itens — Shuichi Pull' };

export default async function PaginaItens() {
  const itens = await listarItensComCorrecoes();

  return (
    <PainelComTrilhas>
      <p className="font-mono text-[8px] tracking-[.2em] text-dim">ARQUIVO 02</p>
      <h1 className="mb-1 text-4xl font-black tracking-tight text-[#F2F2F5]">
        COFRE DE EVIDÊNCIAS
      </h1>
      <p className="mb-6 text-[11px] text-dim">
        {itens.length} itens catalogados: peso, raridade, receita e onde cada um aparece.
      </p>

      <GradeEvidencias itens={itens} />
    </PainelComTrilhas>
  );
}
