import { redirect } from 'next/navigation';
import { sessaoAdm } from '@/lib/adm/sessao';
import { BarraLateral } from '@/components/adm/BarraLateral';

export default async function AdmLayout({ children }: { children: React.ReactNode }) {
  const sessao = await sessaoAdm();
  if (!sessao) redirect('/sem-acesso');

  return (
    <div className="relative flex min-h-screen flex-col bg-[#050805] text-neutral-100 md:flex-row">
      <div aria-hidden className="crt-lines pointer-events-none fixed inset-0 z-0 opacity-[.1]" />
      <BarraLateral papel={sessao.papel} />
      <main className="relative z-10 min-w-0 flex-1 p-4 md:p-6">{children}</main>
    </div>
  );
}
