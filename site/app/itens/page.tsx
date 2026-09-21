import { listarItensComCorrecoes } from '@/lib/itens-corrigidos';
import { obterTextos } from '@/lib/textos';
import { GradeEvidencias } from '@/components/itens/GradeEvidencias';
import { resumirItem } from '@/lib/itens-resumo';
import { PainelComTrilhas } from '@/components/layout/PainelComTrilhas';

export const metadata = { title: 'Itens — Shuichi Pull' };

export default async function PaginaItens() {
  const [itens, t] = await Promise.all([listarItensComCorrecoes(), obterTextos()]);

  return (
    <PainelComTrilhas>
      <p className="font-mono text-[8px] tracking-[.2em] text-dim">ARQUIVO 02</p>
      <h1 className="mb-1 text-4xl font-black tracking-tight text-[#F2F2F5]">
        {t('itens.titulo')}
      </h1>
      <p className="mb-6 text-[11px] text-dim">
        {t('itens.introducao', { total: itens.length })}
      </p>

      <GradeEvidencias itens={itens.map(resumirItem)} />
    </PainelComTrilhas>
  );
}
