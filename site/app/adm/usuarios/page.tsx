import { repositorioUsuarios } from '@/db/repositorios/usuarios';
import { CartaoUsuario } from '@/components/adm/CartaoUsuario';
import { definirStatusUuidAction, definirPodeSerHostAction } from './acoes';

export default async function AdmUsuarios() {
  const usuarios = await repositorioUsuarios.listarTodos();
  const pendentes = usuarios.filter((u) => u.uuidStatus === 'pendente' && u.uuidGmod);
  const resto = usuarios.filter((u) => !(u.uuidStatus === 'pendente' && u.uuidGmod));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-bold">Usuários</h1>
      <p className="text-sm text-neutral-400">
        Aprovar/banir UIDs do GMod e controlar quem pode organizar partida como host.
      </p>

      {pendentes.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-bold text-amber-400">UID aguardando revisão ({pendentes.length})</h2>
          {pendentes.map((u) => (
            <CartaoUsuario
              key={u.discordId}
              discordId={u.discordId}
              discordNome={u.discordNome}
              discordAvatar={u.discordAvatar}
              uuidGmod={u.uuidGmod}
              uuidStatus={u.uuidStatus}
              podeSerHost={u.podeSerHost}
              aoDefinirStatus={definirStatusUuidAction}
              aoDefinirPodeSerHost={definirPodeSerHostAction}
            />
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-bold text-neutral-400">Todos os usuários ({resto.length})</h2>
        {resto.map((u) => (
          <CartaoUsuario
            key={u.discordId}
            discordId={u.discordId}
            discordNome={u.discordNome}
            discordAvatar={u.discordAvatar}
            uuidGmod={u.uuidGmod}
            uuidStatus={u.uuidStatus}
            podeSerHost={u.podeSerHost}
            aoDefinirStatus={definirStatusUuidAction}
            aoDefinirPodeSerHost={definirPodeSerHostAction}
          />
        ))}
      </div>
    </div>
  );
}
