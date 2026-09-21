import { repositorioPartidas } from '@/db/repositorios/partidas';
import { repositorioUsuarios } from '@/db/repositorios/usuarios';
import { CartaoPartida } from '@/components/adm/CartaoPartida';
import { cancelarPartidaAdminAction, transferirHostAction } from './acoes';

import { formatarDataHoraBR } from '@/lib/fuso';

export default async function AdmPartidas() {
  const todas = await repositorioPartidas.listarAbertas();

  const hosts = new Map<string, string>();
  const totais = new Map<number, number>();
  for (const p of todas) {
    if (!hosts.has(p.hostDiscordId)) {
      const u = await repositorioUsuarios.buscar(p.hostDiscordId);
      hosts.set(p.hostDiscordId, u?.discordNome ?? p.hostDiscordId);
    }
    totais.set(p.id, (await repositorioPartidas.participantes(p.id)).length);
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-bold">Partidas</h1>
      <p className="text-sm text-neutral-400">
        Gestão rápida: cancelar uma partida sem depender do host, ou transferir o host pra outra pessoa.
      </p>

      {todas.length === 0 ? (
        <p className="text-sm text-neutral-500">Nenhuma partida agendada ou finalizada ainda.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {todas.map((p) => (
            <CartaoPartida
              key={p.id}
              partidaId={p.id}
              titulo={p.titulo}
              hostNome={hosts.get(p.hostDiscordId) ?? p.hostDiscordId}
              dataHora={formatarDataHoraBR(p.dataHora)}
              status={p.status}
              totalParticipantes={totais.get(p.id) ?? 0}
              aoCancelar={cancelarPartidaAdminAction}
              aoTransferirHost={transferirHostAction}
            />
          ))}
        </div>
      )}
    </div>
  );
}
