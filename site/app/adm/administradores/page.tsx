import { redirect } from 'next/navigation';
import { sessaoAdm } from '@/lib/adm/sessao';
import { repositorioAdms } from '@/db/repositorios/administradores';
import { promoverAdmAction, rebaixarAdmAction } from './acoes';
import { ListaAdms } from '@/components/adm/ListaAdms';

export default async function AdmAdministradores() {
  // Defense-in-depth: the layout only checks "is this an authenticated
  // admin" (any papel), not which one — a chefe-only page must gate itself.
  // (proxy.ts itself only refreshes the session; it doesn't block anything.)
  // Uses sessaoAdm() + redirect() (not exigirChefe(), which throws) so a
  // non-chefe lands on the same /sem-acesso page as a logged-out visitor,
  // matching Task 5's layout pattern — exigirChefe() stays reserved for
  // Server Actions, where a thrown, catchable rejection is what the calling
  // component's error handling expects.
  const sessao = await sessaoAdm();
  if (sessao?.papel !== 'chefe') redirect('/sem-acesso');

  const adms = await repositorioAdms.listarAdms();

  return (
    <div>
      <h1 className="mb-4 text-lg font-bold">Administradores</h1>
      <ListaAdms adms={adms} aoPromover={promoverAdmAction} aoRebaixar={rebaixarAdmAction} />
    </div>
  );
}
