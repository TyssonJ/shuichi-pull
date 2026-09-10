import { redirect } from 'next/navigation';
import { sessaoAdm } from '@/lib/adm/sessao';
import { BarraLateral } from '@/components/adm/BarraLateral';

export default async function AdmLayout({ children }: { children: React.ReactNode }) {
  const sessao = await sessaoAdm();
  if (!sessao) redirect('/sem-acesso');

  return (
    <div className="flex min-h-screen bg-neutral-950 text-neutral-100">
      <BarraLateral papel={sessao.papel} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
