import { redirect } from 'next/navigation';
import { sessaoAdm } from '@/lib/adm/sessao';
import { repositorioAuditoria } from '@/db/repositorios/auditoria';
import { TabelaAuditoria } from '@/components/adm/TabelaAuditoria';

export default async function AdmAuditoria() {
  // Defense-in-depth: proxy.ts (Task 3) only checks "authenticated admin",
  // and the Task 5 layout doesn't distinguish adm/chefe — a chefe-only page
  // must gate itself. Uses sessaoAdm() + redirect() (not exigirChefe(),
  // which throws) so a non-chefe lands on the same /sem-acesso page as a
  // logged-out visitor, matching Task 5's layout pattern — exigirChefe()
  // stays reserved for Server Actions, where a thrown, catchable rejection
  // is what the calling component's error handling expects.
  const sessao = await sessaoAdm();
  if (sessao?.papel !== 'chefe') redirect('/sem-acesso');

  const linhas = await repositorioAuditoria.listarAuditoria();

  return (
    <div>
      <h1 className="mb-4 text-lg font-bold">Auditoria</h1>
      <TabelaAuditoria linhas={linhas} />
    </div>
  );
}
